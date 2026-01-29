import db from '../database/db.js';

class Donor {
    static async getAll(filters = {}) {
        let query = 'SELECT * FROM donors WHERE 1=1';
        const params = [];

        if (filters.blood_type) {
            query += ' AND blood_type = ?';
            params.push(filters.blood_type);
        }

        if (filters.city) {
            query += ' AND city LIKE ?';
            params.push(`%${filters.city}%`);
        }

        if (filters.available !== undefined) {
            query += ' AND available = ?';
            params.push(filters.available ? 1 : 0);
        }

        query += ' ORDER BY created_at DESC';

        return await db.query(query, params);
    }

    static async getById(id) {
        return await db.get('SELECT * FROM donors WHERE id = ?', [id]);
    }

    static async getByUserId(userId) {
        return await db.get('SELECT * FROM donors WHERE user_id = ?', [userId]);
    }

    static async create(donor) {
        const result = await db.run(`
            INSERT INTO donors (user_id, name, blood_type, phone, email, city, address, available, last_donation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            donor.user_id || null,
            donor.name,
            donor.blood_type,
            donor.phone,
            donor.email || null,
            donor.city,
            donor.address || null,
            donor.available !== undefined ? (donor.available ? 1 : 0) : 1,
            donor.last_donation || null
        ]);

        return { id: result.lastInsertRowid, ...donor };
    }

    static async update(id, donor) {
        const fields = [];
        const params = [];

        if (donor.name) { fields.push('name = ?'); params.push(donor.name); }
        if (donor.blood_type) { fields.push('blood_type = ?'); params.push(donor.blood_type); }
        if (donor.phone) { fields.push('phone = ?'); params.push(donor.phone); }
        if (donor.email !== undefined) { fields.push('email = ?'); params.push(donor.email); }
        if (donor.city) { fields.push('city = ?'); params.push(donor.city); }
        if (donor.address !== undefined) { fields.push('address = ?'); params.push(donor.address); }
        if (donor.available !== undefined) { fields.push('available = ?'); params.push(donor.available ? 1 : 0); }
        if (donor.last_donation !== undefined) { fields.push('last_donation = ?'); params.push(donor.last_donation); }

        if (fields.length === 0) return await this.getById(id);

        params.push(id);
        await db.run(`UPDATE donors SET ${fields.join(', ')} WHERE id = ?`, params);

        return await this.getById(id);
    }

    static async delete(id) {
        return await db.run('DELETE FROM donors WHERE id = ?', [id]);
    }

    static async getByBloodType(bloodType) {
        return await db.query('SELECT * FROM donors WHERE blood_type = ? AND available = 1', [bloodType]);
    }

    static async getStats() {
        const total = await db.get('SELECT COUNT(*) as count FROM donors');
        const available = await db.get('SELECT COUNT(*) as count FROM donors WHERE available = 1');
        const byType = await db.query(`
            SELECT blood_type, COUNT(*) as count 
            FROM donors 
            WHERE available = 1 
            GROUP BY blood_type
        `);

        return {
            total: total.count,
            available: available.count,
            byType: byType.reduce((acc, item) => {
                acc[item.blood_type] = item.count;
                return acc;
            }, {})
        };
    }
}

export default Donor;
