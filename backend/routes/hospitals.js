import { Router } from 'express';
import Hospital from '../models/Hospital.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// Get current hospital profile
router.get('/me', verifyToken, (req, res) => {
    try {
        const hospital = Hospital.getByUserId(req.user.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital profile not found' });
        }
        res.json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all hospitals
router.get('/', (req, res) => {
    try {
        const filters = {
            city: req.query.city,
            search: req.query.search
        };

        const hospitals = Hospital.getAll(filters);
        res.json({ success: true, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get hospital statistics
router.get('/stats', (req, res) => {
    try {
        const stats = Hospital.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single hospital
router.get('/:id', (req, res) => {
    try {
        const hospital = Hospital.getById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }
        res.json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create hospital
router.post('/', (req, res) => {
    try {
        const { name, address, city, phone, email, latitude, longitude, emergency_contact } = req.body;

        if (!name || !address || !city || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Name, address, city, and phone are required'
            });
        }

        const hospital = Hospital.create({ name, address, city, phone, email, latitude, longitude, emergency_contact });
        res.status(201).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update hospital
router.put('/:id', (req, res) => {
    try {
        const hospital = Hospital.getById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }

        const updated = Hospital.update(req.params.id, req.body);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete hospital
router.delete('/:id', (req, res) => {
    try {
        const hospital = Hospital.getById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, error: 'Hospital not found' });
        }

        Hospital.delete(req.params.id);
        res.json({ success: true, message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
