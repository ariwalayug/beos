import { Worker } from 'bullmq';
import { connection } from './index.js';
import db from '../database/pg.js';

// ==========================================
// EMERGENCY REQUEST WORKER
// ==========================================
export const emergencyWorker = new Worker('emergency-requests', async (job) => {
    const { id, blood_type, urgency, hospital_id, units } = job.data;

    console.log(`Processing emergency request ${id} - ${blood_type} ${urgency}`);

    try {
        // 1. Find matching donors
        const donors = await db.query(`
            SELECT d.id, d.name, d.phone, d.city
            FROM donors d
            WHERE d.blood_type = $1
              AND d.available = true
              AND (d.last_donation IS NULL OR d.last_donation < NOW() - INTERVAL '56 days')
            ORDER BY d.total_donations ASC
            LIMIT 20
        `, [blood_type]);

        if (donors.length === 0) {
            console.log(`No matching donors for request ${id}`);
            return { matched: 0 };
        }

        // 2. Update request status to 'matched'
        await db.run(`
            UPDATE blood_requests 
            SET status = 'matched', matched_at = NOW() 
            WHERE id = $1
        `, [id]);

        // 3. Queue SMS alerts to donors (handled by SMS worker)
        const { queueDonorAlerts } = await import('./index.js');
        const message = `URGENT: ${blood_type} blood needed. ${units} units at Hospital ID ${hospital_id}. Reply YES to respond.`;
        await queueDonorAlerts(donors, message, id);

        return { matched: donors.length, requestId: id };

    } catch (error) {
        console.error(`Error processing emergency ${id}:`, error);
        throw error; // Will trigger retry
    }
}, {
    connection,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000
    }
});

emergencyWorker.on('completed', (job, result) => {
    console.log(`Emergency ${job.id} completed: ${result.matched} donors matched`);
});

emergencyWorker.on('failed', (job, err) => {
    console.error(`Emergency ${job?.id} failed:`, err.message);
});

// ==========================================
// AUDIT LOG WORKER
// ==========================================
export const auditWorker = new Worker('audit-logs', async (job) => {
    const { user_id, action, entity_type, entity_id, ip_address, user_agent, changes, metadata } = job.data;

    await db.run(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, changes, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
        user_id,
        action,
        entity_type,
        entity_id,
        ip_address,
        user_agent,
        JSON.stringify(changes),
        JSON.stringify(metadata)
    ]);
}, {
    connection,
    concurrency: 10 // High concurrency for logging
});

auditWorker.on('failed', (job, err) => {
    console.error('Audit log failed:', err.message);
});

console.log('Queue workers initialized');
