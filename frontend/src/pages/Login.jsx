import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
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
        <div className="auth-page">
            {/* Animated Background */}
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1">🩸</div>
                    <div className="shape shape-2">❤️</div>
                    <div className="shape shape-3">💉</div>
                </div>
            </div>

            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding animate-slide-left">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <span className="logo-icon">🩸</span>
                            <span className="logo-text">BEOS</span>
                        </div>
                        <h1 className="brand-tagline">
                            Welcome Back,
                            <span className="text-gradient-animated"> Hero</span>
                        </h1>
                        <p className="brand-description">
                            Sign in to continue saving lives. Your next mission awaits.
                        </p>

                        <div className="brand-stats">
                            <div className="brand-stat">
                                <span className="stat-value">10K+</span>
                                <span className="stat-label">Lives Saved</span>
                            </div>
                            <div className="brand-stat">
                                <span className="stat-value">500+</span>
                                <span className="stat-label">Active Heroes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-section animate-slide-right">
                    <div className="auth-card glass-card">
                        <div className="auth-header">
                            <h2>Sign In</h2>
                            <p>Enter your credentials to access your account</p>
                        </div>

                        {error && (
                            <div className="auth-error animate-shake">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group floating-label">
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder=" "
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <label htmlFor="email">Email Address</label>
                                <span className="input-icon">📧</span>
                            </div>

                            <div className="form-group floating-label">
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder=" "
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <label htmlFor="password">Password</label>
                                <span className="input-icon">🔒</span>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="#" className="forgot-link">Forgot Password?</a>
                            </div>

                            <button
                                type="submit"
                                className="btn-auth-primary"
                                disabled={submitting}
                            >
                                <span className="btn-glow"></span>
                                <span className="btn-text">
                                    {submitting ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn google">
                                <span className="social-icon">G</span>
                                Google
                            </button>
                            <button className="social-btn github">
                                <span className="social-icon">⌘</span>
                                GitHub
                            </button>
                        </div>

                        <div className="auth-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="auth-link">
                                    Join the Heroes →
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
