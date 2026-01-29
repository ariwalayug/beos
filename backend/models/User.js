import db from '../database/db.js';
import bcrypt from 'bcryptjs';

class User {
    static async create({ email, password, role }) {
        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const result = await db.run(`
                INSERT INTO users (email, password_hash, role)
                VALUES (?, ?, ?)
            `, [email, passwordHash, role]);

            return { id: result.lastInsertRowid, email, role };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed') || error.message.includes('unique constraint')) {
                throw new Error('Email already registered');
            }
            throw error;
        }
    }

    static async findByEmail(email) {
        return await db.get('SELECT * FROM users WHERE email = ?', [email]);
    }

    static async findById(id) {
        // Return without password hash
        const user = await db.get('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
        return user;
    }

    static async verifyPassword(user, password) {
        return await bcrypt.compare(password, user.password_hash);
    }
}

export default User;
