import db from './database/db.js';

console.log('\n=== DATABASE VERIFICATION ===\n');

// Check Users
const users = db.prepare('SELECT id, email, role FROM users').all();
console.log('USERS:', users.length);
users.forEach(u => console.log(`  - ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));

// Check Donors
const donors = db.prepare('SELECT COUNT(*) as count FROM donors').get();
console.log('\nDONORS:', donors.count);

// Check Hospitals
const hospitals = db.prepare('SELECT COUNT(*) as count FROM hospitals').get();
console.log('HOSPITALS:', hospitals.count);

// Check Blood Banks
const bloodBanks = db.prepare('SELECT COUNT(*) as count FROM blood_banks').get();
console.log('BLOOD BANKS:', bloodBanks.count);

// Check Blood Requests
const requests = db.prepare('SELECT COUNT(*) as count FROM blood_requests').get();
console.log('BLOOD REQUESTS:', requests.count);

// Check Blood Inventory
const inventory = db.prepare('SELECT COUNT(*) as count FROM blood_inventory').get();
console.log('BLOOD INVENTORY RECORDS:', inventory.count);

// Show recent blood requests
const recentRequests = db.prepare('SELECT id, patient_name, blood_type, urgency, status, created_at FROM blood_requests ORDER BY created_at DESC LIMIT 5').all();
console.log('\nRECENT BLOOD REQUESTS:');
recentRequests.forEach(r => console.log(`  - ID: ${r.id}, Patient: ${r.patient_name}, Type: ${r.blood_type}, Urgency: ${r.urgency}, Status: ${r.status}`));

console.log('\n=== END VERIFICATION ===\n');
process.exit(0);
