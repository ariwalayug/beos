import { Router } from 'express';
import Donor from '../models/Donor.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// Get current donor profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const donor = await Donor.getByUserId(req.user.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor profile not found' });
        }
        res.json({ success: true, data: donor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all donors with optional filters
router.get('/', async (req, res) => {
    try {
        const filters = {
            blood_type: req.query.blood_type,
            city: req.query.city,
            available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined
        };

        const donors = await Donor.getAll(filters);
        res.json({ success: true, data: donors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get donor statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Donor.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get donors by blood type
router.get('/blood-type/:bloodType', async (req, res) => {
    try {
        const donors = await Donor.getByBloodType(req.params.bloodType);
        res.json({ success: true, data: donors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single donor
router.get('/:id', async (req, res) => {
    try {
        const donor = await Donor.getById(req.params.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        res.json({ success: true, data: donor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create donor
router.post('/', async (req, res) => {
    try {
        const { name, blood_type, phone, email, city, address, available } = req.body;

        if (!name || !blood_type || !phone || !city) {
            return res.status(400).json({
                success: false,
                error: 'Name, blood type, phone, and city are required'
            });
        }

        const donor = await Donor.create({ name, blood_type, phone, email, city, address, available });
        res.status(201).json({ success: true, data: donor });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update donor
router.put('/:id', async (req, res) => {
    try {
        const donor = await Donor.getById(req.params.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }

        const updated = await Donor.update(req.params.id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete donor
router.delete('/:id', async (req, res) => {
    try {
        const donor = await Donor.getById(req.params.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }

        await Donor.delete(req.params.id);
        res.json({ success: true, message: 'Donor deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
