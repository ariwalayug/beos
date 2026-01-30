import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import donorsRouter from './routes/donors.js';
import hospitalsRouter from './routes/hospitals.js';
import bloodBanksRouter from './routes/bloodBanks.js';
import bloodRequestsRouter from './routes/bloodRequests.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import smsRouter from './routes/sms.js';

// Import socket handler
import { setupSocketHandlers } from './socket/handler.js';

// Import models for stats (use PostgreSQL adapter)
import db from './database/pg.js';

// Import queue workers (starts processing)
import './queues/workers.js';
import { getQueueStats, closeQueues } from './queues/index.js';

const app = express();
const httpServer = createServer(app);

// ==========================================
// SOCKET.IO SETUP
// ==========================================
const io = new Server(httpServer, {
    cors: {
        origin: [
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'https://beos-eta.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

setupSocketHandlers(io);

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://beos-eta.vercel.app'
    ],
    credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true }));

// ==========================================
// RATE LIMITING
// ==========================================
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Rate limit exceeded. Please try again shortly.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, error: 'Too many login attempts. Please try again later.' }
});

const emergencyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: { success: false, error: 'Emergency request limit reached.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/requests', emergencyLimiter);

// ==========================================
// REQUEST CONTEXT
// ==========================================
app.use((req, res, next) => {
    req.io = io;
    req.startTime = Date.now();
    next();
});

// Request logging
app.use((req, res, next) => {
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        if (duration > 1000) {
            console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    next();
});

// ==========================================
// HEALTH & STATUS ENDPOINTS
// ==========================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Blood Emergency Platform API (Production)',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', async (req, res) => {
    const dbHealth = await db.healthCheck();
    const queueStats = await getQueueStats().catch(() => null);

    res.json({
        status: dbHealth.healthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealth,
        queues: queueStats
    });
});

// Dashboard stats endpoint
app.get('/api/dashboard', async (req, res) => {
    try {
        const [donors, requests, inventory] = await Promise.all([
            db.get('SELECT COUNT(*) as total, COUNT(CASE WHEN available THEN 1 END) as available FROM donors'),
            db.get(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled,
                    COUNT(CASE WHEN urgency = 'critical' AND status = 'pending' THEN 1 END) as critical
                FROM blood_requests
            `),
            db.query(`
                SELECT blood_type, SUM(units) as units 
                FROM blood_inventory 
                GROUP BY blood_type
            `)
        ]);

        res.json({
            success: true,
            data: {
                donors,
                requests,
                inventory
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRouter);
app.use('/api/donors', donorsRouter);
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/blood-banks', bloodBanksRouter);
app.use('/api/requests', bloodRequestsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/sms', smsRouter);

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak stack traces in production
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(err.status || 500).json({
        success: false,
        error: message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
async function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    httpServer.close(async () => {
        console.log('HTTP server closed');

        // Close queues
        await closeQueues();

        // Close database
        await db.close();

        console.log('Graceful shutdown complete');
        process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🩸 BEOS Production API Server v2.0                         ║
║                                                               ║
║   Server:     http://localhost:${PORT}                          ║
║   Database:   PostgreSQL (${process.env.DATABASE_URL ? 'Connected' : 'Not configured'})              ║
║   Queue:      BullMQ + Redis                                  ║
║   SMS:        Twilio (${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Not configured'})                    ║
║                                                               ║
║   Security:   Helmet, Rate Limiting, RBAC                    ║
║   Compliance: Audit Logging, Data Retention                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});

export { app, io };
