import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Map, Activity, LogOut, User, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import './Header.css';

function Header() {
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className="header professional">
                <div className="container header-content">
                    <div className="header-left">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <Menu size={24} />
                        </button>

                        <Link to="/" className="logo">
                            <div className="logo-icon-box">
                                <Droplet fill="currentColor" size={20} />
                            </div>
                            <div className="logo-text">
                                <span className="logo-title">BEOS</span>
                                <span className="logo-subtitle">Network</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="nav hide-mobile">
                        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                        <Link to="/donors" className={`nav-link ${isActive('/donors') ? 'active' : ''}`}>Donors</Link>
                        <Link to="/hospitals" className={`nav-link ${isActive('/hospitals') ? 'active' : ''}`}>Hospitals</Link>
                        <Link to="/blood-banks" className={`nav-link ${isActive('/blood-banks') ? 'active' : ''}`}>Inventory</Link>
                        <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>
                            <Map size={16} /> Live Map
                        </Link>
                        <Link to="/emergency" className={`nav-link nav-emergency ${isActive('/emergency') ? 'active' : ''}`}>
                            <Activity size={16} /> Emergency
                        </Link>
                    </nav>

                    <div className="header-actions">
                        <div className="hide-mobile">
                            <ThemeToggle className="mini" />
                        </div>

                        {isAuthenticated ? (
                            <div className="user-menu hide-mobile">
                                <div className="user-info">
                                    <User size={16} />
                                    <span className="user-email">{user?.email}</span>
                                </div>
                                <button onClick={logout} className="btn-logout">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons hide-mobile">
                                <Link to="/login" className="btn-login">Login</Link>
                                <Link to="/register" className="btn-register">Register</Link>
                            </div>
                        )}

                        {/* Mobile: Just show a minimal profile icon or link if needed, but menu usually handles it */}
                    </div>
                </div>
            </header>

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                isAuthenticated={isAuthenticated}
                logout={logout}
                user={user}
            />
        </>
    );
}

export default Header;
