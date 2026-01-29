import db from './database/db.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    const email = 'ariwalayug181@gmail.com'; // Fixed admin email
    const password = 'Yugariwala@2008'; // Initial password, should be changed
    const role = 'admin';

    console.log('Checking for existing admin...');
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existingAdmin) {
        console.log('Admin user already exists.');
        return;
    }

    console.log('Creating admin user...');
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const stmt = db.prepare(`
            INSERT INTO users (email, password_hash, role)
            VALUES (?, ?, ?)
        `);

        stmt.run(email, passwordHash, role);
        console.log(`Admin created successfully.\nEmail: ${email}\nPassword: ${password}`);
    } catch (error) {
        console.error('Error creating admin:', error.message);
    }
};

createAdmin();
