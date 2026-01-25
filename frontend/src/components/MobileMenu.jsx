import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    Building2,
    Droplet,
    Map,
    Activity,
    X,
    Power,
    LogIn,
    UserPlus,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import './MobileMenu.css';

const MobileMenu = ({ isOpen, onClose, isAuthenticated, logout, user }) => {
    const location = useLocation();
    const menuRef = useRef(null);

    // Close menu when route changes
    useEffect(() => {
        onClose();
    }, [location.pathname]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const isActive = (path) => location.pathname === path;

    const menuVariants = {
        closed: {
            x: '-100%',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        open: {
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    const overlayVariants = {
        closed: { opacity: 0 },
        open: { opacity: 1 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="mobile-menu-overlay"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        transition={{ duration: 0.2 }}
                    />

                    <motion.div
                        className="mobile-menu-drawer"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        ref={menuRef}
                    >
                        <div className="mobile-menu-header">
                            <Link to="/" className="mobile-logo">
                                <Droplet className="text-red-600 fill-current" size={24} />
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg leading-none">BEOS</span>
                                    <span className="text-xs text-gray-400">Network</span>
                                </div>
                            </Link>
                            <button onClick={onClose} className="btn-icon-close" aria-label="Close Menu">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mobile-menu-content">
                            {isAuthenticated && (
                                <div className="user-profile-summary">
                                    <div className="avatar-circle">
                                        <User size={20} />
                                    </div>
                                    <div className="user-details">
                                        <span className="user-email-mobile">{user?.email}</span>
                                        <span className="user-role-badge">{user?.role || 'Member'}</span>
                                    </div>
                                </div>
                            )}

                            <nav className="mobile-nav">
                                <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
                                    <Home size={20} /> Home
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link to="/donors" className={`mobile-nav-link ${isActive('/donors') ? 'active' : ''}`}>
                                        <Users size={20} /> Donors
                                    </Link>
                                )}
                                <Link to="/hospitals" className={`mobile-nav-link ${isActive('/hospitals') ? 'active' : ''}`}>
                                    <Building2 size={20} /> Hospitals
                                </Link>
                                <Link to="/blood-banks" className={`mobile-nav-link ${isActive('/blood-banks') ? 'active' : ''}`}>
                                    <Droplet size={20} /> Inventory
                                </Link>
                                <Link to="/map" className={`mobile-nav-link ${isActive('/map') ? 'active' : ''}`}>
                                    <Map size={20} /> Live Map
                                </Link>
                                <Link to="/emergency" className={`mobile-nav-link emergency-link ${isActive('/emergency') ? 'active' : ''}`}>
                                    <Activity size={20} /> Emergency
                                </Link>
                            </nav>

                            <div className="mobile-menu-footer">
                                <div className="theme-toggle-wrapper">
                                    <span>Theme</span>
                                    <ThemeToggle />
                                </div>

                                <div className="mobile-auth-actions">
                                    {isAuthenticated ? (
                                        <button onClick={logout} className="btn mobile-btn-logout">
                                            <Power size={18} /> Logout
                                        </button>
                                    ) : (
                                        <div className="auth-grid">
                                            <Link to="/login" className="btn btn-secondary mobile-auth-btn">
                                                <LogIn size={18} /> Login
                                            </Link>
                                            <Link to="/register" className="btn btn-primary mobile-auth-btn">
                                                <UserPlus size={18} /> Join Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
