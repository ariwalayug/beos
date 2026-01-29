import db from './database/db.js';
import bcrypt from 'bcryptjs';

const updateAdmin = async () => {
    const newEmail = 'ariwalayug181@gmail.com';
    const newPassword = 'Yugariwala@2008';

    console.log('Updating admin credentials...');

    try {
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Try to update the existing admin (admin@beos.com) if they exist
        const result = db.prepare(`
            UPDATE users 
            SET email = ?, password_hash = ? 
            WHERE role = 'admin' OR email = 'admin@beos.com'
        `).run(newEmail, passwordHash);

        if (result.changes > 0) {
            console.log('Admin credentials updated successfully.');
        } else {
            console.log('No existing admin found to update. Creating new one...');
            // Fallback: Create if not exists
            const insert = db.prepare(`
                INSERT INTO users (email, password_hash, role)
                VALUES (?, ?, 'admin')
            `).run(newEmail, passwordHash);
            console.log('New admin created with ID:', insert.lastInsertRowid);
        }

    } catch (error) {
        console.error('Error updating admin:', error.message);
    }
};

updateAdmin();
