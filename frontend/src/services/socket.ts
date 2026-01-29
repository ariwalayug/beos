import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

    connect(): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                withCredentials: true,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('connect_error', (error: Error) => {
                console.error('Socket connection error:', error);
            });
        }

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    on<T = unknown>(event: string, callback: (data: T) => void): void {
        if (this.socket) {
            this.socket.on(event, callback as (data: unknown) => void);
        }

        // Track listeners for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback as (data: unknown) => void);
    }

    off<T = unknown>(event: string, callback: (data: T) => void): void {
        if (this.socket) {
            this.socket.off(event, callback as (data: unknown) => void);
        }

        this.listeners.get(event)?.delete(callback as (data: unknown) => void);
    }

    emit<T = unknown>(event: string, data?: T): void {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    // Convenience methods for common events
    getCriticalRequests(): void {
        this.emit('get-critical-requests');
    }

    getStats(): void {
        this.emit('get-stats');
    }

    toggleAvailability(donorId: number, available: boolean): void {
        this.emit('toggle-availability', { donorId, available });
    }

    sendEmergencyRequest<T>(data: T): void {
        this.emit('emergency-request', data);
    }

    updateRequestStatus(requestId: number, status: string): void {
        this.emit('update-request-status', { requestId, status });
    }

    joinCityRoom(city: string): void {
        this.emit('join-city', city);
    }

    joinBloodTypeRoom(bloodType: string): void {
        this.emit('join-blood-type', bloodType);
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
export { socketService };
