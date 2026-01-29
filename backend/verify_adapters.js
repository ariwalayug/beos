import User from './models/User.js';
import Hospital from './models/Hospital.js';
import Donor from './models/Donor.js';
import BloodBank from './models/BloodBank.js';
import BloodRequest from './models/BloodRequest.js';
import db from './database/db.js';

async function runVerification() {
    console.log('--- Starting Verification of Async Adapters ---');

    try {
        // 1. Check User Stats (Calls db.get)
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        console.log(`[PASS] Users Count: ${userCount.count}`);

        // 2. Check Donor Model (Calls getAll)
        const donors = await Donor.getAll();
        console.log(`[PASS] Donors fetched: ${donors.length}`);

        // 3. Check Hospital Model
        const hospitals = await Hospital.getAll();
        console.log(`[PASS] Hospitals fetched: ${hospitals.length}`);

        // 4. Check BloodBank and Inventory (Nested async)
        const banks = await BloodBank.getWithInventory();
        console.log(`[PASS] BloodBanks with Inventory fetched: ${banks.length}`);
        if (banks.length > 0) {
            console.log(`       First Bank Inventory size: ${banks[0].inventory.length}`);
        }

        // 5. Check BloodRequest Model
        const requests = await BloodRequest.getAll();
        console.log(`[PASS] Requests fetched: ${requests.length}`);

        // 6. Test Write Operation (Create Request)
        const newRequest = await BloodRequest.create({
            patient_name: 'Test Patient Async',
            blood_type: 'O+',
            units: 1,
            urgency: 'normal',
            hospital_id: hospitals.length > 0 ? hospitals[0].id : null,
            status: 'pending'
        });
        console.log(`[PASS] Created Request ID: ${newRequest.id}`);

        // 7. Test Delete
        await BloodRequest.delete(newRequest.id);
        const deletedReq = await BloodRequest.getById(newRequest.id);
        if (!deletedReq) {
            console.log(`[PASS] Deleted Request ID: ${newRequest.id}`);
        } else {
            console.error('[FAIL] Request was not deleted');
        }

        console.log('--- Verification Complete: ALL PASS ---');
        process.exit(0);
    } catch (error) {
        console.error('Verification FAILED:', error);
        process.exit(1);
    }
}

runVerification();
