import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: JSX.Element;
    roles?: string[];
}

function ProtectedRoute({ children, roles = [] }: ProtectedRouteProps) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const { showToast } = useToast();

    const isUnauthorized = roles.length > 0 && (!user || !roles.includes(user.role));

    useEffect(() => {
        if (isAuthenticated && isUnauthorized) {
            showToast('Access Denied: You do not have permission to view this page.', 'error');
        }
    }, [isAuthenticated, isUnauthorized]);

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isUnauthorized) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
