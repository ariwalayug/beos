import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 10 C50 10, 20 45, 20 60 C20 77, 33 90, 50 90 C67 90, 80 77, 80 60 C80 45, 50 10, 50 10 Z" fill="url(#headerGradient)" />
                            <defs>
                                <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#DC2626" />
                                    <stop offset="100%" stopColor="#991B1B" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">Blood Emergency</span>
                        <span className="logo-subtitle">Platform</span>
                    </div>
                </Link>

                <nav className="nav">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        Home
                    </Link>
                    <Link to="/donors" className={`nav-link ${isActive('/donors') ? 'active' : ''}`}>
                        Donors
                    </Link>
                    <Link to="/hospitals" className={`nav-link ${isActive('/hospitals') ? 'active' : ''}`}>
                        Hospitals
                    </Link>
                    <Link to="/blood-banks" className={`nav-link ${isActive('/blood-banks') ? 'active' : ''}`}>
                        Blood Banks
                    </Link>
                    <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>
                        Live Map
                    </Link>
                    <Link to="/emergency" className={`nav-link nav-emergency ${isActive('/emergency') ? 'active' : ''}`}>
                        <span className="emergency-dot"></span>
                        Emergency
                    </Link>
                </nav>

                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <span className="user-email">{user?.email}</span>
                            <button onClick={logout} className="btn btn-outline" style={{ marginLeft: '1rem' }}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-outline">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
