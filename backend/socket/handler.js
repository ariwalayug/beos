import BloodRequest from '../models/BloodRequest.js';
import Donor from '../models/Donor.js';
import BloodBank from '../models/BloodBank.js';

export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Send initial data on connection
        socket.emit('connected', {
            message: 'Connected to Blood Emergency Platform',
            timestamp: new Date().toISOString()
        });

        // Handle request for critical alerts
        socket.on('get-critical-requests', () => {
            const criticalRequests = BloodRequest.getCritical();
            socket.emit('critical-requests', criticalRequests);
        });

        // Handle request for stats
        socket.on('get-stats', () => {
            const stats = {
                requests: BloodRequest.getStats(),
                donors: Donor.getStats(),
                inventory: BloodBank.getTotalInventory()
            };
            socket.emit('stats-update', stats);
        });

        // Handle donor availability toggle
        socket.on('toggle-availability', (data) => {
            const { donorId, available } = data;
            try {
                const updated = Donor.update(donorId, { available });
                io.emit('donor-updated', updated);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Handle new emergency request via socket
        socket.on('emergency-request', (data) => {
            try {
                const request = BloodRequest.create({
                    ...data,
                    urgency: 'critical'
                });
                io.emit('new-request', request);
                io.emit('critical-alert', request);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Handle request status update
        socket.on('update-request-status', (data) => {
            const { requestId, status } = data;
            try {
                const updated = BloodRequest.update(requestId, { status });
                io.emit('request-updated', updated);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Join specific rooms for targeted notifications
        socket.on('join-city', (city) => {
            socket.join(`city:${city}`);
            console.log(`Socket ${socket.id} joined city room: ${city}`);
        });

        socket.on('join-blood-type', (bloodType) => {
            socket.join(`blood:${bloodType}`);
            console.log(`Socket ${socket.id} joined blood type room: ${bloodType}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

export default setupSocketHandlers;
