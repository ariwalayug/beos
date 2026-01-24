import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socket';

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = socketService.connect();
        if (!socket) return;

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        setIsConnected(socket.connected);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, []);

    const subscribe = useCallback((event, callback) => {
        socketService.on(event, callback);
        return () => socketService.off(event, callback);
    }, []);

    const emit = useCallback((event, data) => {
        socketService.emit(event, data);
    }, []);

    return { isConnected, subscribe, emit };
}

export function useCriticalAlerts() {
    const [alerts, setAlerts] = useState([]);
    const subscribeRef = useRef(null);

    useEffect(() => {
        const handleAlert = (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 10));
        };

        socketService.on('critical-alert', handleAlert);

        return () => {
            socketService.off('critical-alert', handleAlert);
        };
    }, []);

    const clearAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return { alerts, clearAlert };
}

export function useRealTimeRequests(initialRequests = []) {
    const [requests, setRequests] = useState(initialRequests);

    useEffect(() => {
        const handleNewRequest = (request) => {
            setRequests(prev => [request, ...prev]);
        };

        const handleUpdated = (updated) => {
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
        };

        const handleFulfilled = (fulfilled) => {
            setRequests(prev => prev.map(r => r.id === fulfilled.id ? fulfilled : r));
        };

        const handleCancelled = (cancelled) => {
            setRequests(prev => prev.map(r => r.id === cancelled.id ? cancelled : r));
        };

        socketService.on('new-request', handleNewRequest);
        socketService.on('request-updated', handleUpdated);
        socketService.on('request-fulfilled', handleFulfilled);
        socketService.on('request-cancelled', handleCancelled);

        return () => {
            socketService.off('new-request', handleNewRequest);
            socketService.off('request-updated', handleUpdated);
            socketService.off('request-fulfilled', handleFulfilled);
            socketService.off('request-cancelled', handleCancelled);
        };
    }, []);

    return { requests, setRequests };
}

export default useSocket;

