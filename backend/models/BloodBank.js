import db from '../database/db.js';

class BloodBank {
    static async getAll(filters = {}) {
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

        return await db.query(query, params);
    }

    static async getById(id) {
        const bank = await db.get('SELECT * FROM blood_banks WHERE id = ?', [id]);
        if (bank) {
            bank.inventory = await this.getInventory(id);
        }
        return bank;
    }

    static async getWithInventory() {
        const banks = await this.getAll();
        return await Promise.all(banks.map(async bank => ({
            ...bank,
            inventory: await this.getInventory(bank.id)
        })));
    }

    static async getInventory(bankId) {
        return await db.query(`
            SELECT blood_type, units, updated_at 
            FROM blood_inventory 
            WHERE blood_bank_id = ?
            ORDER BY blood_type
        `, [bankId]);
    }

    static async create(bloodBank) {
        const result = await db.run(`
            INSERT INTO blood_banks (user_id, name, address, city, phone, email, latitude, longitude, operating_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            bloodBank.user_id || null,
            bloodBank.name,
            bloodBank.address,
            bloodBank.city,
            bloodBank.phone,
            bloodBank.email || null,
            bloodBank.latitude || null,
            bloodBank.longitude || null,
            bloodBank.operating_hours || null
        ]);

        // Initialize inventory for all blood types
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        for (const type of bloodTypes) {
            await db.run(`
                INSERT INTO blood_inventory (blood_bank_id, blood_type, units)
                VALUES (?, ?, 0)
            `, [result.lastInsertRowid, type]);
        }

        return { id: result.lastInsertRowid, ...bloodBank };
    }

    static async update(id, bloodBank) {
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

        if (fields.length === 0) return await this.getById(id);

        params.push(id);
        await db.run(`UPDATE blood_banks SET ${fields.join(', ')} WHERE id = ?`, params);

        return await this.getById(id);
    }

    static async updateInventory(bankId, bloodType, units) {
        await db.run(`
            UPDATE blood_inventory 
            SET units = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE blood_bank_id = ? AND blood_type = ?
        `, [units, bankId, bloodType]);
        return await this.getInventory(bankId);
    }

    static async delete(id) {
        await db.run('DELETE FROM blood_inventory WHERE blood_bank_id = ?', [id]);
        return await db.run('DELETE FROM blood_banks WHERE id = ?', [id]);
    }

    static async getTotalInventory() {
        return await db.query(`
            SELECT blood_type, SUM(units) as total_units
            FROM blood_inventory
            GROUP BY blood_type
            ORDER BY blood_type
        `);
    }

    static async findByBloodType(bloodType, minUnits = 1) {
        return await db.query(`
            SELECT bb.*, bi.units
            FROM blood_banks bb
            JOIN blood_inventory bi ON bb.id = bi.blood_bank_id
            WHERE bi.blood_type = ? AND bi.units >= ?
            ORDER BY bi.units DESC
        `, [bloodType, minUnits]);
    }

    static async getByUserId(userId) {
        return await db.get('SELECT * FROM blood_banks WHERE user_id = ?', [userId]);
    }

    // --- Batch Management System ---

    static async getBatches(bankId) {
        return await db.query(`
            SELECT * FROM blood_batches 
            WHERE blood_bank_id = ? 
            ORDER BY expiry_date ASC
        `, [bankId]);
    }

    static async addBatch(bankId, { blood_type, units, expiry_date }) {
        const result = await db.run(`
            INSERT INTO blood_batches (blood_bank_id, blood_type, units, expiry_date)
            VALUES (?, ?, ?, ?)
        `, [bankId, blood_type, units, expiry_date]);

        await this.syncInventory(bankId, blood_type);
        return { id: result.lastInsertRowid, blood_bank_id: bankId, blood_type, units, expiry_date };
    }

    static async updateBatch(id, { units, expiry_date }) {
        const batch = await db.get('SELECT * FROM blood_batches WHERE id = ?', [id]);
        if (!batch) throw new Error('Batch not found');

        const fields = [];
        const params = [];

        if (units !== undefined) { fields.push('units = ?'); params.push(units); }
        if (expiry_date !== undefined) { fields.push('expiry_date = ?'); params.push(expiry_date); }

        if (fields.length > 0) {
            params.push(id);
            await db.run(`UPDATE blood_batches SET ${fields.join(', ')} WHERE id = ?`, params);

            // Sync inventory for this blood type
            await this.syncInventory(batch.blood_bank_id, batch.blood_type);
        }

        return await db.get('SELECT * FROM blood_batches WHERE id = ?', [id]);
    }

    static async deleteBatch(id) {
        const batch = await db.get('SELECT * FROM blood_batches WHERE id = ?', [id]);
        if (!batch) return;

        await db.run('DELETE FROM blood_batches WHERE id = ?', [id]);
        await this.syncInventory(batch.blood_bank_id, batch.blood_type);
    }

    static async syncInventory(bankId, bloodType) {
        // Calculate total units from batches
        const result = await db.get(`
            SELECT SUM(units) as total 
            FROM blood_batches 
            WHERE blood_bank_id = ? AND blood_type = ?
        `, [bankId, bloodType]);

        const totalUnits = result?.total || 0;

        // Update main inventory table
        await db.run(`
            INSERT INTO blood_inventory (blood_bank_id, blood_type, units, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(blood_bank_id, blood_type) 
            DO UPDATE SET units = excluded.units, updated_at = CURRENT_TIMESTAMP
        `, [bankId, bloodType, totalUnits]);
    }
}

export default BloodBank;
