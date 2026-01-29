import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, ...profileData } = req.body;

        if (!['user', 'hospital', 'blood_bank'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        // Create User
        const user = await User.create({ email, password, role });

        // Create Profile based on role
        let profile;
        const profileWithUserId = { ...profileData, user_id: user.id, email }; // ensure email is synced

        if (role === 'user') {
            // Default role is User, but for this platform usually means Potential Donor
            // Let's assume 'user' role maps to Donor profile
            profile = await Donor.create(profileWithUserId);
        } else if (role === 'hospital') {
            profile = await Hospital.create(profileWithUserId);
        } else if (role === 'blood_bank') {
            profile = await BloodBank.create(profileWithUserId);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profileId: profile.id
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user || !(await User.verifyPassword(user, password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
});

export default router;
