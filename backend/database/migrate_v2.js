import db from './db.js';

const migrations = [
    "ALTER TABLE blood_requests ADD COLUMN gender TEXT CHECK(gender IN ('Male', 'Female', 'Other'));",
    "ALTER TABLE blood_requests ADD COLUMN doctor_name TEXT;",
    "ALTER TABLE blood_requests ADD COLUMN component_type TEXT DEFAULT 'Whole Blood';",
    "ALTER TABLE blood_requests ADD COLUMN diagnosis TEXT;",
    "ALTER TABLE blood_requests ADD COLUMN allergies TEXT;",
    "ALTER TABLE blood_requests ADD COLUMN is_critical INTEGER DEFAULT 0;"
];

console.log("Running migrations...");
migrations.forEach(query => {
    try {
        db.prepare(query).run();
        console.log(`Executed: ${query}`);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log(`Skipped (column exists): ${query}`);
        } else {
            console.error(`Error executing ${query}: ${err.message}`);
        }
    }
});
console.log("Migrations complete.");
