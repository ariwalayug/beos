import db from '../database/db.js';

class Hospital {
    static async getAll(filters = {}) {
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

        return await db.query(query, params);
    }

    static async getById(id) {
        return await db.get('SELECT * FROM hospitals WHERE id = ?', [id]);
    }

    static async getByUserId(userId) {
        return await db.get('SELECT * FROM hospitals WHERE user_id = ?', [userId]);
    }

    static async create(hospital) {
        const result = await db.run(`
            INSERT INTO hospitals (user_id, name, address, city, phone, email, latitude, longitude, emergency_contact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            hospital.user_id || null,
            hospital.name,
            hospital.address,
            hospital.city,
            hospital.phone,
            hospital.email || null,
            hospital.latitude || null,
            hospital.longitude || null,
            hospital.emergency_contact || null
        ]);

        return { id: result.lastInsertRowid, ...hospital };
    }

    static async update(id, hospital) {
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

        if (fields.length === 0) return await this.getById(id);

        params.push(id);
        await db.run(`UPDATE hospitals SET ${fields.join(', ')} WHERE id = ?`, params);

        return await this.getById(id);
    }

    static async delete(id) {
        return await db.run('DELETE FROM hospitals WHERE id = ?', [id]);
    }

    static async getStats() {
        const total = await db.get('SELECT COUNT(*) as count FROM hospitals');
        const byCity = await db.query(`
            SELECT city, COUNT(*) as count 
            FROM hospitals 
            GROUP BY city
            ORDER BY count DESC
        `);

        return {
            total: total.count,
            byCity
        };
    }
}

export default Hospital;
