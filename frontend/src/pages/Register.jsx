import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        user_role: 'user',
        email: '',
        password: '',
        confirmPassword: '',
        blood_type: '',
        phone: '',
        city: '',
        address: '',
        available: true
    });

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        try {
            setSubmitting(true);
            const registrationData = {
                email: formData.email,
                password: formData.password,
                role: formData.user_role,
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                address: formData.address,
                ...(formData.user_role === 'user' && {
                    blood_type: formData.blood_type,
                    available: formData.available
                })
            };

            await register(registrationData);
            setSuccess(true);
            setTimeout(() => {
                if (registrationData.role === 'admin') navigate('/admin-dashboard');
                else if (registrationData.role === 'hospital') navigate('/hospital-dashboard');
                else if (registrationData.role === 'blood_bank') navigate('/blood-bank-dashboard');
                else navigate('/donor-dashboard');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Registration failed');
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.user_role) {
            setError('Please select a role');
            return;
        }
        if (step === 2 && formData.user_role === 'user' && !formData.blood_type) {
            setError('Please select your blood type');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
                <div className="success-card glass-card animate-scale-up">
                    <div className="success-icon">🎉</div>
                    <h2>Welcome to the Team!</h2>
                    <p>You're now officially a Hero in our lifesaving network.</p>
                    <div className="success-loader">
                        <span></span>
                    </div>
                    <p className="redirect-text">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
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

            <div className="auth-container register-container">
                <div className="auth-branding animate-slide-left">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <span className="logo-icon">🩸</span>
                            <span className="logo-text">BEOS</span>
                        </div>
                        <h1 className="brand-tagline">
                            Become a
                            <span className="text-gradient-animated"> First Responder</span>
                        </h1>
                        <p className="brand-description">
                            Join thousands of heroes who are saving lives every day. Your blood type could be the perfect match for someone in need.
                        </p>

                        <div className="brand-benefits">
                            <div className="benefit-item">
                                <span className="benefit-icon">⚡</span>
                                <span>Real-time emergency alerts</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">📍</span>
                                <span>Location-based matching</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">🏆</span>
                                <span>Track your impact</span>
                            </div>
                        </div>

                        <div className="auth-footer desktop-only">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">Sign In →</Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="auth-form-section animate-slide-right">
                    <div className="auth-card register-card glass-card">
                        {/* Step Progress */}
                        <div className="register-steps">
                            <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                                <span className="step-label">Role</span>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                                <span className="step-label">Profile</span>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
                                <div className="step-number">3</div>
                                <span className="step-label">Account</span>
                            </div>
                        </div>

                        {error && (
                            <div className="auth-error animate-shake">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Step 1: Role Selection */}
                            {step === 1 && (
                                <div className="form-step animate-fade-in">
                                    <div className="step-header">
                                        <h2>Choose Your Role</h2>
                                        <p>How would you like to contribute?</p>
                                    </div>

                                    <div className="role-grid">
                                        <div className="role-option">
                                            <input
                                                type="radio"
                                                id="role-donor"
                                                name="role"
                                                value="user"
                                                checked={formData.user_role === 'user'}
                                                onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                                            />
                                            <label htmlFor="role-donor" className="role-label">
                                                <span className="role-icon">🦸</span>
                                                <span className="role-name">Donor</span>
                                                <span className="role-desc">Save lives by donating blood</span>
                                            </label>
                                        </div>

                                        <div className="role-option">
                                            <input
                                                type="radio"
                                                id="role-hospital"
                                                name="role"
                                                value="hospital"
                                                checked={formData.user_role === 'hospital'}
                                                onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                                            />
                                            <label htmlFor="role-hospital" className="role-label">
                                                <span className="role-icon">🏥</span>
                                                <span className="role-name">Hospital</span>
                                                <span className="role-desc">Request blood for patients</span>
                                            </label>
                                        </div>

                                        <div className="role-option">
                                            <input
                                                type="radio"
                                                id="role-bloodbank"
                                                name="role"
                                                value="blood_bank"
                                                checked={formData.user_role === 'blood_bank'}
                                                onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                                            />
                                            <label htmlFor="role-bloodbank" className="role-label">
                                                <span className="role-icon">🏦</span>
                                                <span className="role-name">Blood Bank</span>
                                                <span className="role-desc">Manage blood inventory</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button type="button" className="btn-auth-primary" onClick={nextStep}>
                                        <span className="btn-text">Continue →</span>
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Profile Info */}
                            {step === 2 && (
                                <div className="form-step animate-fade-in">
                                    <div className="step-header">
                                        <h2>
                                            {formData.user_role === 'user' ? 'Your Blood Profile' :
                                                formData.user_role === 'hospital' ? 'Hospital Details' : 'Blood Bank Details'}
                                        </h2>
                                        <p>Tell us more about you</p>
                                    </div>

                                    <div className="form-group floating-label">
                                        <input
                                            type="text"
                                            id="name"
                                            className="form-input"
                                            placeholder=" "
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="name">
                                            {formData.user_role === 'user' ? 'Full Name' : 'Organization Name'}
                                        </label>
                                        <span className="input-icon">👤</span>
                                    </div>

                                    {formData.user_role === 'user' && (
                                        <div className="form-group">
                                            <label className="form-label-static">Select Your Blood Type</label>
                                            <div className="blood-type-grid">
                                                {bloodTypes.map(type => (
                                                    <div key={type} className="blood-type-option">
                                                        <input
                                                            type="radio"
                                                            id={`blood-${type}`}
                                                            name="blood_type"
                                                            value={type}
                                                            checked={formData.blood_type === type}
                                                            onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                                        />
                                                        <label htmlFor={`blood-${type}`} className="blood-type-label">
                                                            {type}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group floating-label">
                                            <input
                                                type="text"
                                                id="city"
                                                className="form-input"
                                                placeholder=" "
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="city">City</label>
                                            <span className="input-icon">📍</span>
                                        </div>
                                        <div className="form-group floating-label">
                                            <input
                                                type="tel"
                                                id="phone"
                                                className="form-input"
                                                placeholder=" "
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="phone">Phone</label>
                                            <span className="input-icon">📱</span>
                                        </div>
                                    </div>

                                    {formData.user_role === 'user' && (
                                        <div className="availability-check">
                                            <label className="toggle-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.available}
                                                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                                />
                                                <span className="toggle-track">
                                                    <span className="toggle-thumb"></span>
                                                </span>
                                                <span className="toggle-text">I'm available to donate now</span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="step-actions">
                                        <button type="button" className="btn-auth-secondary" onClick={prevStep}>
                                            ← Back
                                        </button>
                                        <button type="button" className="btn-auth-primary" onClick={nextStep}>
                                            <span className="btn-text">Continue →</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Account Creation */}
                            {step === 3 && (
                                <div className="form-step animate-fade-in">
                                    <div className="step-header">
                                        <h2>Create Your Account</h2>
                                        <p>Almost there! Set up your login credentials.</p>
                                    </div>

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
                                            minLength={6}
                                        />
                                        <label htmlFor="password">Password</label>
                                        <span className="input-icon">🔒</span>
                                    </div>

                                    <div className="form-group floating-label">
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className="form-input"
                                            placeholder=" "
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <span className="input-icon">🔐</span>
                                    </div>

                                    <div className="step-actions">
                                        <button type="button" className="btn-auth-secondary" onClick={prevStep}>
                                            ← Back
                                        </button>
                                        <button type="submit" className="btn-auth-primary" disabled={submitting}>
                                            <span className="btn-glow"></span>
                                            <span className="btn-text">
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-small"></span>
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    '🚀 Complete Registration'
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="auth-footer mobile-only">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">Sign In →</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
