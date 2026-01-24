import db from '../database/db.js';

class BloodBank {
    static getAll(filters = {}) {
        let query = 'SELECT * FROM blood_banks WHERE 1=1';
        const params = [];

        if (filters.city) {
            query += ' AND city LIKE ?';
            params.push(`%${filters.city}%`);
        }

        if (filters.search) {
            query += ' AND (name LIKE ? OR address LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY name ASC';

        return db.prepare(query).all(...params);
    }

    static getById(id) {
        const bank = db.prepare('SELECT * FROM blood_banks WHERE id = ?').get(id);
        if (bank) {
            bank.inventory = this.getInventory(id);
        }
        return bank;
    }

    static getWithInventory() {
        const banks = this.getAll();
        return banks.map(bank => ({
            ...bank,
            inventory: this.getInventory(bank.id)
        }));
    }

    static getInventory(bankId) {
        return db.prepare(`
            SELECT blood_type, units, updated_at 
            FROM blood_inventory 
            WHERE blood_bank_id = ?
            ORDER BY blood_type
        `).all(bankId);
    }

    static create(bloodBank) {
        const stmt = db.prepare(`
            INSERT INTO blood_banks (user_id, name, address, city, phone, email, latitude, longitude, operating_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            bloodBank.user_id || null,
            bloodBank.name,
            bloodBank.address,
            bloodBank.city,
            bloodBank.phone,
            bloodBank.email || null,
            bloodBank.latitude || null,
            bloodBank.longitude || null,
            bloodBank.operating_hours || null
        );

        // Initialize inventory for all blood types
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const insertInventory = db.prepare(`
            INSERT INTO blood_inventory (blood_bank_id, blood_type, units)
            VALUES (?, ?, 0)
        `);

        bloodTypes.forEach(type => insertInventory.run(result.lastInsertRowid, type));

        return { id: result.lastInsertRowid, ...bloodBank };
    }

    static update(id, bloodBank) {
        const fields = [];
        const params = [];

        if (bloodBank.name) { fields.push('name = ?'); params.push(bloodBank.name); }
        if (bloodBank.address) { fields.push('address = ?'); params.push(bloodBank.address); }
        if (bloodBank.city) { fields.push('city = ?'); params.push(bloodBank.city); }
        if (bloodBank.phone) { fields.push('phone = ?'); params.push(bloodBank.phone); }
        if (bloodBank.email !== undefined) { fields.push('email = ?'); params.push(bloodBank.email); }
        if (bloodBank.latitude !== undefined) { fields.push('latitude = ?'); params.push(bloodBank.latitude); }
        if (bloodBank.longitude !== undefined) { fields.push('longitude = ?'); params.push(bloodBank.longitude); }
        if (bloodBank.operating_hours !== undefined) { fields.push('operating_hours = ?'); params.push(bloodBank.operating_hours); }

        if (fields.length === 0) return this.getById(id);

        params.push(id);
        db.prepare(`UPDATE blood_banks SET ${fields.join(', ')} WHERE id = ?`).run(...params);

        return this.getById(id);
    }

    static updateInventory(bankId, bloodType, units) {
        const stmt = db.prepare(`
            UPDATE blood_inventory 
            SET units = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE blood_bank_id = ? AND blood_type = ?
        `);

        stmt.run(units, bankId, bloodType);
        return this.getInventory(bankId);
    }

    static delete(id) {
        db.prepare('DELETE FROM blood_inventory WHERE blood_bank_id = ?').run(id);
        return db.prepare('DELETE FROM blood_banks WHERE id = ?').run(id);
    }

    static getTotalInventory() {
        return db.prepare(`
            SELECT blood_type, SUM(units) as total_units
            FROM blood_inventory
            GROUP BY blood_type
            ORDER BY blood_type
        `).all();
    }

    static findByBloodType(bloodType, minUnits = 1) {
        return db.prepare(`
            SELECT bb.*, bi.units
            FROM blood_banks bb
            JOIN blood_inventory bi ON bb.id = bi.blood_bank_id
            WHERE bi.blood_type = ? AND bi.units >= ?
            ORDER BY bi.units DESC
        `).all(bloodType, minUnits);
    }

    static getByUserId(userId) {
        return db.prepare('SELECT * FROM blood_banks WHERE user_id = ?').get(userId);
    }

    // --- Batch Management System ---

    static getBatches(bankId) {
        return db.prepare(`
            SELECT * FROM blood_batches 
            WHERE blood_bank_id = ? 
            ORDER BY expiry_date ASC
        `).all(bankId);
    }

    static addBatch(bankId, { blood_type, units, expiry_date }) {
        const result = db.prepare(`
            INSERT INTO blood_batches (blood_bank_id, blood_type, units, expiry_date)
            VALUES (?, ?, ?, ?)
        `).run(bankId, blood_type, units, expiry_date);

        this.syncInventory(bankId, blood_type);
        return { id: result.lastInsertRowid, blood_bank_id: bankId, blood_type, units, expiry_date };
    }

    static updateBatch(id, { units, expiry_date }) {
        const batch = db.prepare('SELECT * FROM blood_batches WHERE id = ?').get(id);
        if (!batch) throw new Error('Batch not found');

        const fields = [];
        const params = [];

        if (units !== undefined) { fields.push('units = ?'); params.push(units); }
        if (expiry_date !== undefined) { fields.push('expiry_date = ?'); params.push(expiry_date); }

        if (fields.length > 0) {
            params.push(id);
            db.prepare(`UPDATE blood_batches SET ${fields.join(', ')} WHERE id = ?`).run(...params);

            // Sync inventory for this blood type
            this.syncInventory(batch.blood_bank_id, batch.blood_type);
        }

        return db.prepare('SELECT * FROM blood_batches WHERE id = ?').get(id);
    }

    static deleteBatch(id) {
        const batch = db.prepare('SELECT * FROM blood_batches WHERE id = ?').get(id);
        if (!batch) return;

        db.prepare('DELETE FROM blood_batches WHERE id = ?').run(id);
        this.syncInventory(batch.blood_bank_id, batch.blood_type);
    }

    static syncInventory(bankId, bloodType) {
        // Calculate total units from batches
        const result = db.prepare(`
            SELECT SUM(units) as total 
            FROM blood_batches 
            WHERE blood_bank_id = ? AND blood_type = ?
        `).get(bankId, bloodType);

        const totalUnits = result.total || 0;

        // Update main inventory table
        db.prepare(`
            INSERT INTO blood_inventory (blood_bank_id, blood_type, units, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(blood_bank_id, blood_type) 
            DO UPDATE SET units = excluded.units, updated_at = CURRENT_TIMESTAMP
        `).run(bankId, bloodType, totalUnits);
    }
}

export default BloodBank;
