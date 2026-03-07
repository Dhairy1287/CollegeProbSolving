import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('scc_user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('scc_token', data.token);
        localStorage.setItem('scc_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        localStorage.setItem('scc_token', data.token);
        localStorage.setItem('scc_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('scc_token');
        localStorage.removeItem('scc_user');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            localStorage.setItem('scc_user', JSON.stringify(data.user));
        } catch { logout(); }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('scc_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
