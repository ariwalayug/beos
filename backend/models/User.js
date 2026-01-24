import db from '../database/db.js';
import bcrypt from 'bcryptjs';

class User {
    static async create({ email, password, role }) {
        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const stmt = db.prepare(`
                INSERT INTO users (email, password_hash, role)
                VALUES (?, ?, ?)
            `);

            const result = stmt.run(email, passwordHash, role);
            return { id: result.lastInsertRowid, email, role };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Email already registered');
            }
            throw error;
        }
    }

    static findByEmail(email) {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    static findById(id) {
        // Return without password hash
        const user = db.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?').get(id);
        return user;
    }

    static async verifyPassword(user, password) {
        return await bcrypt.compare(password, user.password_hash);
    }
}

export default User;
