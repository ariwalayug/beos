import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.getMe();
                    setUser(data.user);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.login({ email, password });
            localStorage.setItem('token', data.token);
            setUser(data.user);

            // Redirect based on role
            // Redirect based on role
            switch (data.user.role) {
                case 'hospital': navigate('/hospital-dashboard'); break;
                case 'blood_bank': navigate('/blood-bank-dashboard'); break;
                case 'admin': navigate('/admin-dashboard'); break;
                case 'user': // Fallthrough for 'user' which is donor
                case 'donor': navigate('/donor-dashboard'); break;
                default: navigate('/');
            }

            showToast('Logged in successfully', 'success');
            return true;
        } catch (error) {
            showToast(error.response?.data?.error || 'Login failed', 'error');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.register(userData);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            setUser(data.user);
            // navigate('/donors'); // Component handles redirect
            showToast('Registration successful', 'success');
            return true;
        } catch (error) {
            showToast(error.response?.data?.error || 'Registration failed', 'error');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
        showToast('Logged out successfully', 'info');
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
