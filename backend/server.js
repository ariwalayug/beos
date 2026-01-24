import express from 'express';
import cors from 'cors';
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

// Import socket handler
import { setupSocketHandlers } from './socket/handler.js';

// Import models for stats
import Donor from './models/Donor.js';
import Hospital from './models/Hospital.js';
import BloodBank from './models/BloodBank.js';
import BloodRequest from './models/BloodRequest.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS
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

// Setup socket handlers
setupSocketHandlers(io);

// Middleware
// Middleware
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
app.use(express.json());

// Attach io to request for use in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Blood Emergency Platform API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Dashboard stats endpoint
app.get('/api/dashboard', (req, res) => {
    try {
        const stats = {
            donors: Donor.getStats(),
            hospitals: Hospital.getStats(),
            requests: BloodRequest.getStats(),
            inventory: BloodBank.getTotalInventory(),
            criticalRequests: BloodRequest.getCritical()
        };
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/donors', donorsRouter);
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/blood-banks', bloodBanksRouter);
app.use('/api/requests', bloodRequestsRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🩸 Blood Emergency Platform API Server                  ║
║                                                           ║
║   Server running on: http://localhost:${PORT}               ║
║   Socket.IO enabled for real-time updates                 ║
║                                                           ║
║   API Endpoints:                                          ║
║   • GET  /api/health          - Health check              ║
║   • GET  /api/dashboard       - Dashboard stats           ║
║   • CRUD /api/donors          - Donor management          ║
║   • CRUD /api/hospitals       - Hospital management       ║
║   • CRUD /api/blood-banks     - Blood bank management     ║
║   • CRUD /api/requests        - Blood request management  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

export { app, io };
