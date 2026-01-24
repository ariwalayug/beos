import db from '../database/db.js';

class Hospital {
    static getAll(filters = {}) {
        let query = 'SELECT * FROM hospitals WHERE 1=1';
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
        return db.prepare('SELECT * FROM hospitals WHERE id = ?').get(id);
    }

    static getByUserId(userId) {
        return db.prepare('SELECT * FROM hospitals WHERE user_id = ?').get(userId);
    }

    static create(hospital) {
        const stmt = db.prepare(`
            INSERT INTO hospitals (user_id, name, address, city, phone, email, latitude, longitude, emergency_contact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            hospital.user_id || null,
            hospital.name,
            hospital.address,
            hospital.city,
            hospital.phone,
            hospital.email || null,
            hospital.latitude || null,
            hospital.longitude || null,
            hospital.emergency_contact || null
        );

        return { id: result.lastInsertRowid, ...hospital };
    }

    static update(id, hospital) {
        const fields = [];
        const params = [];

        if (hospital.name) { fields.push('name = ?'); params.push(hospital.name); }
        if (hospital.address) { fields.push('address = ?'); params.push(hospital.address); }
        if (hospital.city) { fields.push('city = ?'); params.push(hospital.city); }
        if (hospital.phone) { fields.push('phone = ?'); params.push(hospital.phone); }
        if (hospital.email !== undefined) { fields.push('email = ?'); params.push(hospital.email); }
        if (hospital.latitude !== undefined) { fields.push('latitude = ?'); params.push(hospital.latitude); }
        if (hospital.longitude !== undefined) { fields.push('longitude = ?'); params.push(hospital.longitude); }
        if (hospital.emergency_contact !== undefined) { fields.push('emergency_contact = ?'); params.push(hospital.emergency_contact); }

        if (fields.length === 0) return this.getById(id);

        params.push(id);
        db.prepare(`UPDATE hospitals SET ${fields.join(', ')} WHERE id = ?`).run(...params);

        return this.getById(id);
    }

    static delete(id) {
        return db.prepare('DELETE FROM hospitals WHERE id = ?').run(id);
    }

    static getStats() {
        const total = db.prepare('SELECT COUNT(*) as count FROM hospitals').get();
        const byCity = db.prepare(`
            SELECT city, COUNT(*) as count 
            FROM hospitals 
            GROUP BY city
            ORDER BY count DESC
        `).all();

        return {
            total: total.count,
            byCity
        };
    }
}

export default Hospital;
