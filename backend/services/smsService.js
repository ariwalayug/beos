import twilio from 'twilio';
import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { connection, smsQueue } from '../queues/index.js';
import db from '../database/pg.js';

dotenv.config();

// Twilio Client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// ==========================================
// SEND SMS
// ==========================================
export async function sendSMS(to, body) {
    try {
        const message = await twilioClient.messages.create({
            body,
            from: TWILIO_PHONE,
            to
        });

        console.log(`SMS sent to ${to}: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`SMS failed to ${to}:`, error.message);
        throw error;
    }
}

// ==========================================
// SMS WORKER (Queue Processing)
// ==========================================
export const smsWorker = new Worker('sms-outbound', async (job) => {
    const { to, body, requestId, donorId } = job.data;

    const result = await sendSMS(to, body);

    // Log to SMS queue table
    await db.run(`
        INSERT INTO sms_queue (to_phone, message, status, sent_at, related_request_id)
        VALUES ($1, $2, 'sent', NOW(), $3)
    `, [to, body, requestId]);

    return result;
}, {
    connection,
    concurrency: 3, // Rate limit Twilio
    limiter: {
        max: 1,
        duration: 1000 // 1 SMS per second max
    }
});

smsWorker.on('completed', (job) => {
    console.log(`SMS job ${job.id} completed`);
});

smsWorker.on('failed', (job, err) => {
    console.error(`SMS job ${job?.id} failed:`, err.message);
    // Log failure
    db.run(`
        INSERT INTO sms_queue (to_phone, message, status, error_message, related_request_id)
        VALUES ($1, $2, 'failed', $3, $4)
    `, [job?.data?.to, job?.data?.body, err.message, job?.data?.requestId]).catch(() => { });
});

// ==========================================
// PARSE INBOUND SMS
// ==========================================
export function parseInboundSMS(body) {
    const text = body.trim().toUpperCase();

    // Donor Confirmation: YES or NO
    if (text === 'YES' || text === 'NO') {
        return { type: 'confirmation', value: text === 'YES' };
    }

    // Status Check: STATUS 1234
    const statusMatch = text.match(/^STATUS\s+(\d+)$/);
    if (statusMatch) {
        return { type: 'status', requestId: parseInt(statusMatch[1]) };
    }

    // Create Request: REQ O+ 2 CRITICAL Apollo Delhi
    const reqMatch = text.match(/^REQ\s+([ABO][B+-]{1,2})\s+(\d+)\s+(CRITICAL|URGENT|NORMAL)\s+(.+)\s+([A-Za-z]+)$/i);
    if (reqMatch) {
        return {
            type: 'create_request',
            blood_type: reqMatch[1].toUpperCase(),
            units: parseInt(reqMatch[2]),
            urgency: reqMatch[3].toLowerCase(),
            hospital_name: reqMatch[4].trim(),
            city: reqMatch[5].trim()
        };
    }

    // Unknown command
    return { type: 'unknown' };
}

// ==========================================
// HANDLE INBOUND SMS
// ==========================================
export async function handleInboundSMS(from, body) {
    const parsed = parseInboundSMS(body);

    switch (parsed.type) {
        case 'confirmation':
            return await handleDonorConfirmation(from, parsed.value);

        case 'status':
            return await handleStatusCheck(from, parsed.requestId);

        case 'create_request':
            return await handleSMSRequest(from, parsed);

        default:
            return {
                reply: 'Unknown command. Use: REQ [type] [units] [urgency] [hospital] [city] or reply YES/NO to alerts.'
            };
    }
}

// Handle donor YES/NO confirmation
async function handleDonorConfirmation(phone, confirmed) {
    // Find donor by phone
    const donor = await db.get('SELECT * FROM donors WHERE phone = $1', [phone]);
    if (!donor) {
        return { reply: 'Donor not found. Please register at our website.' };
    }

    // Find most recent pending request sent to this donor
    const recentSMS = await db.get(`
        SELECT sq.related_request_id 
        FROM sms_queue sq
        WHERE sq.to_phone = $1 AND sq.related_request_id IS NOT NULL
        ORDER BY sq.created_at DESC LIMIT 1
    `, [phone]);

    if (!recentSMS?.related_request_id) {
        return { reply: 'No active request found for your response.' };
    }

    const requestId = recentSMS.related_request_id;

    if (confirmed) {
        // Link donor to request
        await db.run(`
            UPDATE blood_requests 
            SET donor_id = $1, status = 'fulfilled', fulfilled_at = NOW()
            WHERE id = $2
        `, [donor.id, requestId]);

        // Update donor stats
        await db.run(`
            UPDATE donors SET total_donations = total_donations + 1, last_donation = NOW()
            WHERE id = $1
        `, [donor.id]);

        // Get hospital contact to notify
        const request = await db.get(`
            SELECT br.*, h.phone as hospital_phone, h.name as hospital_name
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.id = $1
        `, [requestId]);

        // Queue SMS to hospital
        if (request?.hospital_phone) {
            await smsQueue.add('send-sms', {
                to: request.hospital_phone,
                body: `Donor confirmed! ${donor.name} (${donor.phone}) will respond to request #${requestId}.`,
                requestId
            });
        }

        return { reply: `Thank you! You've been confirmed for request #${requestId}. The hospital will contact you.` };
    } else {
        return { reply: 'Response recorded. Thank you for letting us know.' };
    }
}

// Handle STATUS check
async function handleStatusCheck(phone, requestId) {
    const request = await db.get(`
        SELECT status, blood_type, units, urgency 
        FROM blood_requests WHERE id = $1
    `, [requestId]);

    if (!request) {
        return { reply: `Request #${requestId} not found.` };
    }

    return {
        reply: `Request #${requestId}: ${request.blood_type} ${request.units} units - Status: ${request.status.toUpperCase()}`
    };
}

// Handle SMS-based request creation
async function handleSMSRequest(phone, parsed) {
    const { blood_type, units, urgency, hospital_name, city } = parsed;

    // Find or create hospital reference
    let hospital = await db.get(
        'SELECT id FROM hospitals WHERE LOWER(name) LIKE $1 AND LOWER(city) = $2',
        [`%${hospital_name.toLowerCase()}%`, city.toLowerCase()]
    );

    // Create request
    const result = await db.run(`
        INSERT INTO blood_requests (hospital_id, blood_type, units, urgency, is_critical, sms_source, contact_phone, status)
        VALUES ($1, $2, $3, $4, $5, true, $6, 'pending')
        RETURNING id
    `, [hospital?.id || null, blood_type, units, urgency, urgency === 'critical', phone]);

    const requestId = result.rows[0]?.id;

    // Queue for processing
    const { queueEmergencyRequest } = await import('../queues/index.js');
    await queueEmergencyRequest({
        id: requestId,
        blood_type,
        units,
        urgency,
        hospital_id: hospital?.id
    });

    return {
        reply: `Request #${requestId} created! ${blood_type} ${units} units (${urgency}). Donors being notified.`
    };
}

export default { sendSMS, parseInboundSMS, handleInboundSMS };
