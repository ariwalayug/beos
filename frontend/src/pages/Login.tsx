import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import { motion } from 'framer-motion';
import './Auth.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const success = await login(formData.email, formData.password);
            if (!success) {
                setError('Invalid email or password');
                setSubmitting(false);
            }
        } catch (err) {
            setError(err.message || 'Login failed');
            setSubmitting(false);
        }
    };

    return (
        <PageTransition className="auth-page professional">
            <div className="auth-background-pro"></div>

            <div className="auth-container">
                <motion.div
                    className="auth-branding"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="brand-logo">
                        <motion.div
                            className="logo-icon-wrapper"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                            <Shield size={32} />
                        </motion.div>
                        <span className="logo-text">BEOS</span>
                    </div>
                    <h1>
                        Welcome Back, <br />
                        <span className="text-primary">First Responder</span>
                    </h1>
                    <p className="brand-desc">
                        Secure access for authorized personnel and registered donors.
                        Your contribution saves lives.
                    </p>

                    <div className="brand-stats-grid">
                        <div className="stat-item">
                            <span className="stat-num">10K+</span>
                            <span className="stat-label">Lives Impacted</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">500+</span>
                            <span className="stat-label">Active Units</span>
                        </div>
                    </div>
                </motion.div>

                <div className="auth-card-wrapper">
                    <motion.div
                        className="auth-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="auth-header">
                            <h2>Sign In</h2>
                            <p>Access your dashboard</p>
                        </div>

                        {error && (
                            <motion.div
                                className="auth-error"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group-pro">
                                <label htmlFor="email">Email</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="name@organization.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-pro">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        style={{ paddingRight: '2.75rem' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-wrapper">
                                    <input type="checkbox" />
                                    <span>Remember for 30 days</span>
                                </label>
                                <a href="#" className="link-muted">Forgot password?</a>
                            </div>

                            <motion.button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={submitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                            </motion.button>
                        </form>

                        <div className="auth-footer">
                            <p>New to the network? <Link to="/register" className="link-primary">Apply for access</Link></p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Login;
