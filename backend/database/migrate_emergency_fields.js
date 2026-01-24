import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'blood_emergency.db');

const db = new Database(dbPath, { verbose: console.log });

console.log('Running migration: Add age, hemoglobin, platelets, past_reaction to blood_requests...');

try {
    const columns = [
        { name: 'age', type: 'INTEGER' },
        { name: 'hemoglobin', type: 'REAL' },
        { name: 'platelets', type: 'INTEGER' },
        { name: 'past_reaction', type: 'TEXT' }
    ];

    const tableInfo = db.prepare('PRAGMA table_info(blood_requests)').all();
    const existingColumns = new Set(tableInfo.map(col => col.name));

    db.transaction(() => {
        for (const col of columns) {
            if (!existingColumns.has(col.name)) {
                console.log(`Adding column: ${col.name}`);
                db.prepare(`ALTER TABLE blood_requests ADD COLUMN ${col.name} ${col.type}`).run();
            } else {
                console.log(`Column ${col.name} already exists. Skipping.`);
            }
        }
    })();

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
