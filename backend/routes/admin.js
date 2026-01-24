import express from 'express';
import db from '../database/db.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure only admins access these routes
router.use(verifyToken, authorizeRoles('admin'));

// GET /stats - System-wide statistics
router.get('/stats', (req, res) => {
    try {
        const users = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
        const requests = db.prepare('SELECT urgency, count(*) as count FROM blood_requests GROUP BY urgency').all();
        const totalDonations = db.prepare('SELECT COUNT(*) as count FROM donations').get().count;
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

        // Process users for cleaner output
        const userStats = {
            total: totalUsers,
            donors: users.find(u => u.role === 'donor')?.count || 0,
            hospitals: users.find(u => u.role === 'hospital')?.count || 0,
            bloodBanks: users.find(u => u.role === 'blood_bank')?.count || 0,
            admins: users.find(u => u.role === 'admin')?.count || 0
        };

        const requestStats = {
            total: requests.reduce((acc, curr) => acc + curr.count, 0),
            critical: requests.find(r => r.urgency === 'critical')?.count || 0,
            normal: requests.find(r => r.urgency === 'normal')?.count || 0
        };

        res.json({
            success: true,
            data: {
                users: userStats,
                requests: requestStats,
                donations: totalDonations
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /users - List all users with details
router.get('/users', (req, res) => {
    try {
        // Query to get user details joined with specific tables if needed, 
        // but for now simple listing with role is enough.
        // potentially join with donors/hospitals names if we want to show Names.

        // This query tries to find a name from any of the profile tables
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.role, 
                u.created_at,
                COALESCE(d.name, h.name, b.name, 'Admin') as name
            FROM users u
            LEFT JOIN donors d ON u.id = d.user_id
            LEFT JOIN hospitals h ON u.id = h.user_id
            LEFT JOIN blood_banks b ON u.id = b.user_id
            ORDER BY u.created_at DESC
        `;

        const users = db.prepare(query).all();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /users/:id - Delete a user
router.delete('/users/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, error: 'Cannot delete your own admin account.' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        // Cascade deletes should handle profile tables if Foreign Keys are set up correctly with ON DELETE CASCADE
        // If not, we might leave orphans, but SQLite foreign key support needs to be enabled.
        // Assuming minimal setup, we just delete the user for now.

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
