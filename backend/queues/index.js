import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis connection for BullMQ
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

connection.on('connect', () => console.log('Redis: Connected'));
connection.on('error', (err) => console.error('Redis Error:', err));

// ==========================================
// QUEUE DEFINITIONS
// ==========================================

// Emergency Request Queue - High Priority
export const emergencyQueue = new Queue('emergency-requests', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500
    }
});

// SMS Outbound Queue
export const smsQueue = new Queue('sms-outbound', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 200
    }
});

// Notification Queue (Email, Push)
export const notificationQueue = new Queue('notifications', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 3000 },
        removeOnComplete: 100
    }
});

// Audit Log Queue - Async logging
export const auditQueue = new Queue('audit-logs', {
    connection,
    defaultJobOptions: {
        attempts: 5,
        removeOnComplete: 1000
    }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Add emergency request to queue with priority
export async function queueEmergencyRequest(requestData, priority = 0) {
    const job = await emergencyQueue.add('process-emergency', requestData, {
        priority: requestData.urgency === 'critical' ? 1 : priority,
        jobId: `emergency-${requestData.id}`
    });
    console.log(`Queued emergency request ${requestData.id} with job ${job.id}`);
    return job;
}

// Queue SMS with automatic retries
export async function queueSMS(phone, message, options = {}) {
    const job = await smsQueue.add('send-sms', {
        to: phone,
        body: message,
        requestId: options.requestId,
        priority: options.priority || 0
    }, {
        priority: options.priority || 0
    });
    return job;
}

// Queue batch SMS to multiple donors
export async function queueDonorAlerts(donors, message, requestId) {
    const jobs = donors.map((donor, index) => ({
        name: 'send-sms',
        data: {
            to: donor.phone,
            body: message,
            donorId: donor.id,
            requestId
        },
        opts: {
            priority: 1,
            delay: index * 100 // Stagger to avoid rate limits
        }
    }));

    await smsQueue.addBulk(jobs);
    console.log(`Queued ${jobs.length} donor alerts for request ${requestId}`);
}

// Queue audit log (async, non-blocking)
export async function queueAuditLog(logData) {
    await auditQueue.add('write-log', logData);
}

// Get queue stats
export async function getQueueStats() {
    const [emergency, sms, notifications, audit] = await Promise.all([
        emergencyQueue.getJobCounts(),
        smsQueue.getJobCounts(),
        notificationQueue.getJobCounts(),
        auditQueue.getJobCounts()
    ]);

    return { emergency, sms, notifications, audit };
}

// Graceful shutdown
export async function closeQueues() {
    await emergencyQueue.close();
    await smsQueue.close();
    await notificationQueue.close();
    await auditQueue.close();
    await connection.quit();
    console.log('All queues closed');
}

export { connection };
