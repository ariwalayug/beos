import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let internalDb;
const isTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

// Initialize Database Connection
if (isTurso) {
    console.log('Connecting to Turso Cloud Database...');
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    internalDb = {
        execute: async (sql, args) => await client.execute({ sql, args }),
        batch: async (stmts) => await client.batch(stmts)
    };
} else {
    // Local SQLite with better-sqlite3 wrapping to match LibSQL interface
    const dbPath = process.env.DB_PATH || join(__dirname, 'blood_emergency.db');
    console.log(`Connecting to local database at: ${dbPath}`);
    const localDb = new Database(dbPath);
    localDb.pragma('journal_mode = WAL');
    localDb.pragma('foreign_keys = ON');

    internalDb = {
        execute: async (sql, args = []) => {
            try {
                // Normalize args to array if object (LibSQL supports named, better-sqlite3 supports named but ensure consistency)
                // For this adapter we will encourage array args.
                const stmt = localDb.prepare(sql);

                if (sql.trim().toLowerCase().startsWith('select')) {
                    const rows = stmt.all(...args);
                    return { rows, rowsAffected: 0, lastInsertRowid: 0n };
                } else {
                    const info = stmt.run(...args);
                    return {
                        rows: [],
                        rowsAffected: info.changes,
                        lastInsertRowid: BigInt(info.lastInsertRowid)
                    };
                }
            } catch (error) {
                console.error("SQL Error:", error.message, sql);
                throw error;
            }
        },
        batch: async (stmts) => {
            // stmts is array of { sql, args } or strings
            const executeMany = localDb.transaction((items) => {
                for (const item of items) {
                    const sql = typeof item === 'string' ? item : item.sql;
                    const args = typeof item === 'string' ? [] : (item.args || []);
                    localDb.prepare(sql).run(...args);
                }
            });
            executeMany(stmts);
            return [];
        }
    };
}

// Exported Adapter Interface
const db = {
    // Select multiple rows
    query: async (sql, params = []) => {
        const res = await internalDb.execute(sql, params);
        return res.rows;
    },
    // Select single row
    get: async (sql, params = []) => {
        const res = await internalDb.execute(sql, params);
        return res.rows[0] || null;
    },
    // Execute write (Insert/Update/Delete)
    run: async (sql, params = []) => {
        const res = await internalDb.execute(sql, params);
        return {
            changes: res.rowsAffected,
            lastInsertRowid: Number(res.lastInsertRowid) // Convert BigInt for JSON safety
        };
    }
};

// ==========================================
// Async Migrations & Seeding
// ==========================================
async function init() {
    try {
        // Core Schema
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        // Split schema into statements if using batch, or just execOne/Multiple
        // For better-sqlite3, we can't just run the whole string if it has multiple stmts in one go if sticking to prepare? 
        // localDb.exec(schema) works. But LibSQL execute(schema) might not if multiple.
        // LibSQL supports update with execute(sql).
        // Let's assume schema.sql is safe to run.

        // Simpler: Just try to run tables creation one by one or splits.
        // For robustness, we will assume tables exist or Schema is applied manually for Turso?
        // No, we want auto-deploy.

        // Simple strategy: Split by ';' and run.
        const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const sql of statements) {
            await internalDb.execute(sql, []);
        }

        console.log('Schema synchronized.');

        // Migration: Add donor_id to blood_requests
        try {
            await db.run('ALTER TABLE blood_requests ADD COLUMN donor_id INTEGER REFERENCES donors(id) ON DELETE SET NULL');
            console.log('Migration: Added donor_id to blood_requests');
        } catch (e) { /* Ignore if exists */ }

        // Migration: blood_batches
        await internalDb.execute(`
            CREATE TABLE IF NOT EXISTS blood_batches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                blood_bank_id INTEGER NOT NULL,
                blood_type TEXT NOT NULL,
                units INTEGER NOT NULL,
                expiry_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id)
            )
        `, []);

        // Inventory Migration Logic (Move inventory to batches)
        const batchCount = await db.get('SELECT COUNT(*) as count FROM blood_batches');
        if (batchCount && batchCount.count === 0) {
            const inventory = await db.query('SELECT * FROM blood_inventory WHERE units > 0');
            if (inventory.length > 0) {
                console.log('Migrating inventory to batches...');
                for (const item of inventory) {
                    await db.run(
                        `INSERT INTO blood_batches (blood_bank_id, blood_type, units, expiry_date) VALUES (?, ?, ?, date('now', '+30 days'))`,
                        [item.blood_bank_id, item.blood_type, item.units]
                    );
                }
            }
        }

        // Migration: Donors Lat/Long
        try {
            await db.run('ALTER TABLE donors ADD COLUMN latitude REAL');
            await db.run('ALTER TABLE donors ADD COLUMN longitude REAL');
            console.log('Migration: Added lat/long to donors');
        } catch (e) { }

        // Migration: Donations table
        await internalDb.execute(`
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
            )
        `, []);

        // Migration: Request Columns
        const newCols = [
            { name: 'gender', type: 'TEXT' },
            { name: 'component_type', type: 'TEXT DEFAULT "Whole Blood"' },
            { name: 'is_critical', type: 'INTEGER DEFAULT 0' },
            { name: 'diagnosis', type: 'TEXT' },
            { name: 'allergies', type: 'TEXT' },
            { name: 'doctor_name', type: 'TEXT' }
        ];

        for (const col of newCols) {
            try {
                await db.run(`ALTER TABLE blood_requests ADD COLUMN ${col.name} ${col.type}`);
            } catch (e) { }
        }

        // SEEDING
        await seedData();

    } catch (error) {
        console.error('Database Initialization Error:', error);
    }
}

async function seedData() {
    const donorCount = await db.get('SELECT COUNT(*) as count FROM donors');
    if (donorCount && donorCount.count === 0) {
        console.log('Seeding initial data...');

        // Donors
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

        for (const d of donors) {
            await db.run(
                'INSERT INTO donors (name, blood_type, phone, email, city, available) VALUES (?, ?, ?, ?, ?, ?)',
                d
            );
        }

        // Hospitals
        const hospitals = [
            ['City General Hospital', '123 Main Street', 'Mumbai', '+91 22 1234 5678', 'contact@citygeneral.com'],
            ['Apollo Hospital', '456 Health Avenue', 'Delhi', '+91 11 2345 6789', 'info@apollo.com'],
            ['Fortis Healthcare', '789 Medical Road', 'Bangalore', '+91 80 3456 7890', 'care@fortis.com'],
        ];
        for (const h of hospitals) {
            await db.run(
                'INSERT INTO hospitals (name, address, city, phone, email) VALUES (?, ?, ?, ?, ?)',
                h
            );
        }

        // Blood Banks
        const banks = [
            ['Red Cross Blood Bank', '100 Donation Drive', 'Mumbai', '+91 22 5678 1234', 'redcross@bloodbank.org'],
            ['LifeLine Blood Center', '200 Vital Street', 'Delhi', '+91 11 6789 2345', 'lifeline@bloodcenter.com'],
            ['National Blood Bank', '300 Health Hub', 'Bangalore', '+91 80 7890 3456', 'national@bloodbank.gov'],
        ];
        for (const b of banks) {
            await db.run(
                'INSERT INTO blood_banks (name, address, city, phone, email) VALUES (?, ?, ?, ?, ?)',
                b
            );
        }

        // Inventory
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        for (let i = 1; i <= 3; i++) {
            for (const type of bloodTypes) {
                const units = Math.floor(Math.random() * 50) + 5;
                await db.run('INSERT INTO blood_inventory (blood_bank_id, blood_type, units) VALUES (?, ?, ?)', [i, type, units]);
            }
        }
    }

    // Seed Admin
    const adminEmail = 'ariwalayug181@gmail.com';
    const adminExists = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (!adminExists) {
        console.log('Seeding admin...');
        const hash = await bcrypt.hash('ariwalayug@2008', 10);
        await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [adminEmail, hash, 'admin']);
    }
}

// Run initialization (Async) - Top level await supported in Modules
await init();

export default db;
