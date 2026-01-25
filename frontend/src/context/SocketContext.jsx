import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Use environment variable for production, fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to backend using environment-aware URL
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket Connected:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket Disconnected');
        });

        // Handle connection errors gracefully
        newSocket.on('connect_error', (error) => {
            console.warn('Socket connection error:', error.message);
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
