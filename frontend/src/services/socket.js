import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) return this.socket;

        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.warn('Socket connection error:', error.message);
            });
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (!this.socket) this.connect();

        this.socket.on(event, callback);

        // Track listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }

        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (!this.socket) this.connect();
        this.socket.emit(event, data);
    }

    // Specific event helpers
    onNewRequest(callback) {
        this.on('new-request', callback);
    }

    onCriticalAlert(callback) {
        this.on('critical-alert', callback);
    }

    onRequestUpdated(callback) {
        this.on('request-updated', callback);
    }

    onRequestFulfilled(callback) {
        this.on('request-fulfilled', callback);
    }

    onStatsUpdate(callback) {
        this.on('stats-update', callback);
    }

    // Request actions
    getCriticalRequests() {
        this.emit('get-critical-requests');
    }

    getStats() {
        this.emit('get-stats');
    }

    createEmergencyRequest(data) {
        this.emit('emergency-request', data);
    }

    joinCity(city) {
        this.emit('join-city', city);
    }

    joinBloodType(bloodType) {
        this.emit('join-blood-type', bloodType);
    }
}

export const socketService = new SocketService();
export default socketService;
