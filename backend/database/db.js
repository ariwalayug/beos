import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const dbPath = process.env.DB_PATH
    ? (process.env.DB_PATH.startsWith('/') || process.env.DB_PATH.match(/^[a-zA-Z]:/) ? process.env.DB_PATH : join(__dirname, process.env.DB_PATH))
    : join(__dirname, 'blood_emergency.db');

const db = new Database(dbPath);
console.log(`Connected to database at: ${dbPath}`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Migration: Add donor_id to blood_requests if not exists
try {
    const tableInfo = db.pragma('table_info(blood_requests)');
    const hasDonorId = tableInfo.some(col => col.name === 'donor_id');

    if (!hasDonorId) {
        console.log('Migrating: Adding donor_id column to blood_requests table...');
        db.prepare('ALTER TABLE blood_requests ADD COLUMN donor_id INTEGER REFERENCES donors(id) ON DELETE SET NULL').run();
    }
} catch (error) {
    console.error('Migration error:', error);
}

// Migration: Create blood_batches for expiry tracking
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS blood_batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blood_bank_id INTEGER NOT NULL,
            blood_type TEXT NOT NULL,
            units INTEGER NOT NULL,
            expiry_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id)
        );
    `);

    // Check if batches are empty but inventory has data (first run migration)
    const batchCount = db.prepare('SELECT COUNT(*) as count FROM blood_batches').get();
    if (batchCount.count === 0) {
        console.log('Migrating: Moving existing inventory to batches...');
        const inventory = db.prepare('SELECT * FROM blood_inventory WHERE units > 0').all();

        const insertBatch = db.prepare(`
            INSERT INTO blood_batches (blood_bank_id, blood_type, units, expiry_date)
            VALUES (?, ?, ?, date('now', '+30 days'))
        `);

        db.transaction(() => {
            inventory.forEach(item => {
                insertBatch.run(item.blood_bank_id, item.blood_type, item.units);
            });
        })();
        console.log('Migration: Created batches from existing inventory.');
    }
} catch (error) {
    console.error('Batch migration error:', error);
}

// Migration: Add latitude/longitude to donors if not exists
try {
    const tableInfo = db.pragma('table_info(donors)');
    const hasLat = tableInfo.some(col => col.name === 'latitude');

    if (!hasLat) {
        console.log('Migrating: Adding location columns to donors table...');
        db.prepare('ALTER TABLE donors ADD COLUMN latitude REAL').run();
        db.prepare('ALTER TABLE donors ADD COLUMN longitude REAL').run();
    }
} catch (error) {
    console.error('Donor migration error:', error);
}

// Migration: Create donations table
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donor_id INTEGER NOT NULL,
            blood_bank_id INTEGER,
            request_id INTEGER,
            blood_type TEXT NOT NULL,
            units INTEGER DEFAULT 1,
            donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (donor_id) REFERENCES donors(id),
            FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id),
            FOREIGN KEY (request_id) REFERENCES blood_requests(id)
        );
        CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
    `);
} catch (error) {
    console.error('Donations table creation error:', error);
}

// Seed initial data if tables are empty
function seedData() {
    const donorCount = db.prepare('SELECT COUNT(*) as count FROM donors').get();

    if (donorCount.count === 0) {
        console.log('Seeding initial data...');

        // Seed donors
        const insertDonor = db.prepare(`
            INSERT INTO donors (name, blood_type, phone, email, city, available)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const donors = [
            ['Rahul Sharma', 'O+', '+91 98765 43210', 'rahul@email.com', 'Mumbai', 1],
            ['Priya Patel', 'A+', '+91 98765 43211', 'priya@email.com', 'Delhi', 1],
            ['Amit Kumar', 'B+', '+91 98765 43212', 'amit@email.com', 'Bangalore', 1],
            ['Sneha Reddy', 'AB+', '+91 98765 43213', 'sneha@email.com', 'Hyderabad', 1],
            ['Vikram Singh', 'O-', '+91 98765 43214', 'vikram@email.com', 'Chennai', 1],
            ['Anjali Gupta', 'A-', '+91 98765 43215', 'anjali@email.com', 'Pune', 1],
            ['Rajesh Verma', 'B-', '+91 98765 43216', 'rajesh@email.com', 'Kolkata', 0],
            ['Meera Nair', 'AB-', '+91 98765 43217', 'meera@email.com', 'Jaipur', 1],
        ];

        donors.forEach(donor => insertDonor.run(...donor));

        // Seed hospitals
        const insertHospital = db.prepare(`
            INSERT INTO hospitals (name, address, city, phone, email, emergency_contact)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const hospitals = [
            ['City General Hospital', '123 Main Street', 'Mumbai', '+91 22 1234 5678', 'contact@citygeneral.com', '+91 22 1234 5679'],
            ['Apollo Hospital', '456 Health Avenue', 'Delhi', '+91 11 2345 6789', 'info@apollo.com', '+91 11 2345 6780'],
            ['Fortis Healthcare', '789 Medical Road', 'Bangalore', '+91 80 3456 7890', 'care@fortis.com', '+91 80 3456 7891'],
            ['AIIMS', '101 Hospital Lane', 'Delhi', '+91 11 4567 8901', 'aiims@gov.in', '+91 11 4567 8902'],
        ];

        hospitals.forEach(hospital => insertHospital.run(...hospital));

        // Seed blood banks
        const insertBloodBank = db.prepare(`
            INSERT INTO blood_banks (name, address, city, phone, email, operating_hours)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const bloodBanks = [
            ['Red Cross Blood Bank', '100 Donation Drive', 'Mumbai', '+91 22 5678 1234', 'redcross@bloodbank.org', '24/7'],
            ['LifeLine Blood Center', '200 Vital Street', 'Delhi', '+91 11 6789 2345', 'lifeline@bloodcenter.com', '8 AM - 10 PM'],
            ['National Blood Bank', '300 Health Hub', 'Bangalore', '+91 80 7890 3456', 'national@bloodbank.gov', '24/7'],
        ];

        bloodBanks.forEach(bank => insertBloodBank.run(...bank));

        // Seed blood inventory
        const insertInventory = db.prepare(`
            INSERT INTO blood_inventory (blood_bank_id, blood_type, units)
            VALUES (?, ?, ?)
        `);

        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        for (let bankId = 1; bankId <= 3; bankId++) {
            bloodTypes.forEach(type => {
                const units = Math.floor(Math.random() * 50) + 5;
                insertInventory.run(bankId, type, units);
            });
        }

        // Seed some blood requests
        const insertRequest = db.prepare(`
            INSERT INTO blood_requests (hospital_id, patient_name, blood_type, units, urgency, status, contact_phone, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const requests = [
            [1, 'Patient A', 'O+', 2, 'critical', 'pending', '+91 98888 88888', 'Emergency surgery required'],
            [2, 'Patient B', 'A-', 1, 'urgent', 'pending', '+91 97777 77777', 'Scheduled operation'],
            [3, 'Patient C', 'B+', 3, 'normal', 'fulfilled', '+91 96666 66666', 'Regular transfusion'],
        ];


        requests.forEach(request => insertRequest.run(...request));

        console.log('Initial data seeded successfully!');
    }

    // Seed Admin User (Always check and create if missing)
    try {
        const adminEmail = 'admin@beos.com';
        const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

        if (!existingAdmin) {
            console.log('Seeding admin user...');
            // Hash: adminpassword123
            const adminPassHash = '$2b$10$YourGeneratedHashHereOrUseBcrypt';
            // Better to compute it or use a pre-computed hash to avoid importing bcrypt here if not needed
            // For simplicity and correctness, let's use the one from create_admin.js logic or similar.
            // Since we can't easily async/await bcrypt here without top-level await or wrapping,
            // we will use a pre-calculated hash for 'adminpassword123'
            const preComputedHash = '$2a$10$wI5.k.aa.w.s.q.r.e.t.u.r.n.s.a.l.t.h.a.s.h.v.a.l.u.e'; // Placeholder, let's use a real one or import bcrypt

            // Actually, let's just do it properly with bcrypt if possible or just use a known hash.
            // 'adminpassword123' -> $2a$10$X7... (example)
            // To be safe, I'll stick to the create_admin.js approach but integrated here.
            // However, db.js looks synchronous. Using bcryptjs.hashSync is better here.
        }
    } catch (err) {
        console.error('Admin seeding error:', err);
    }
}

import bcrypt from 'bcryptjs';

// Seed Admin Function
function seedAdmin() {
    const email = 'admin@beos.com';
    const password = 'adminpassword123';
    const role = 'admin';

    try {
        const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (!existingAdmin) {
            console.log('Creating admin user...');
            const passwordHash = bcrypt.hashSync(password, 10);

            db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(email, passwordHash, role);
            console.log('Admin user created successfully.');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
}

seedData();
seedAdmin();

export default db;
