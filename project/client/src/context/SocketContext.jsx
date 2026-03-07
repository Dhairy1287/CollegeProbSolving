import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!user) return;
        socketRef.current = io('/', { withCredentials: true });
        socketRef.current.on('connect', () => {
            setConnected(true);
            socketRef.current.emit('join-room', `user-${user._id}`);
            socketRef.current.emit('join-room', `college-${user.college}`);
        });
        socketRef.current.on('disconnect', () => setConnected(false));
        return () => { socketRef.current?.disconnect(); };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
