import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useToast } from './ToastContext';
import { User, RegisterData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.getMe();
                    if (response.data) {
                        setUser(response.data);
                    }
                } catch {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.login({ email, password });
            localStorage.setItem('token', response.token);
            setUser(response.user);

            // Redirect based on role
            switch (response.user.role) {
                case 'hospital':
                    navigate('/hospital-dashboard');
                    break;
                case 'blood_bank':
                    navigate('/blood-bank-dashboard');
                    break;
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'user':
                case 'donor':
                    navigate('/donor-dashboard');
                    break;
                default:
                    navigate('/');
            }

            showToast('Logged in successfully', 'success');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            showToast(errorMessage, 'error');
            return false;
        }
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            const response = await api.register(userData as unknown as Record<string, unknown>);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            showToast('Registration successful', 'success');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            showToast(errorMessage, 'error');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
        showToast('Logged out successfully', 'info');
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
