import BloodRequest from '../models/BloodRequest.js';
import NotificationService from '../services/NotificationService.js';
import Donor from '../models/Donor.js';

export const getMyValues = async (req, res) => {
    try {
        const donor = Donor.getByUserId(req.user.id);
        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor profile not found' });
        }

        const history = BloodRequest.getHistory(donor.id);
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllRequests = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            urgency: req.query.urgency,
            blood_type: req.query.blood_type,
            hospital_id: req.query.hospital_id
        };

        const requests = BloodRequest.getAll(filters);
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const stats = BloodRequest.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getPending = async (req, res) => {
    try {
        const requests = BloodRequest.getPending();
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getCritical = async (req, res) => {
    try {
        const requests = BloodRequest.getCritical();
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const request = BloodRequest.getById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createRequest = async (req, res) => {
    try {
        const {
            patient_name, age, gender, hemoglobin, platelets,
            blood_type, units, component_type, urgency, is_critical,
            diagnosis, past_reaction, allergies, doctor_name,
            contact_phone, notes
        } = req.body;

        const hospital_id = req.user.role === 'hospital' ? req.user.hospital_id : null;

        if (!blood_type) {
            return res.status(400).json({
                success: false,
                error: 'Blood type is required'
            });
        }

        const request = BloodRequest.create({
            hospital_id, patient_name, age, gender, hemoglobin, platelets,
            blood_type, units, component_type, urgency, is_critical,
            diagnosis, past_reaction, allergies, doctor_name,
            contact_phone, notes
        });

        // Emit socket event for real-time updates
        if (req.io) {
            req.io.emit('new-request', request);
            if (request.urgency === 'critical') {
                req.io.emit('critical-alert', request);
            }
        }

        // Send Notifications (Async)
        if (request.urgency === 'critical') {
            NotificationService.broadcastCritical(request);
        } else {
            // For normal requests, maybe just a silent push to relevant donors (omitted for brevity)
            console.log(`[INFO] Created normal request #${request.id}`);
        }

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // BloodRequest.update model handles field filtering

        const request = BloodRequest.update(id, updates);

        if (req.io) {
            req.io.emit('request-updated', request);
        }

        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const fulfillRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const donor_id = req.user.role === 'donor' ? req.body.donor_id : null; // Actually usually derived from auth user

        // Logic to get donor ID from user if needed, assuming req.body has it or we query it
        // For strict correctness we should query the donor profile of the logged in user
        let finalDonorId = donor_id;
        if (req.user.role === 'donor') {
            const donor = Donor.getByUserId(req.user.id);
            if (donor) finalDonorId = donor.id;
        }

        const request = BloodRequest.fulfill(id, finalDonorId);

        if (req.io) {
            req.io.emit('request-fulfilled', request);
            req.io.emit('request-updated', request);
        }

        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteRequest = async (req, res) => {
    try {
        BloodRequest.delete(req.params.id);
        res.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getMatches = async (req, res) => {
    try {
        const request = BloodRequest.getById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        const matches = Donor.findMatches({
            blood_type: request.blood_type,
            latitude: request.latitude, // Assuming request/hospital has lat/long
            longitude: request.longitude
        });

        res.json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const cancelRequest = async (req, res) => {
    try {
        // Logic for cancellation if needed, or mapping to update status
        const request = BloodRequest.update(req.params.id, { status: 'cancelled' });
        if (req.io) req.io.emit('request-updated', request);
        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
