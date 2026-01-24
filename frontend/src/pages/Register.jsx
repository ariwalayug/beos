import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        user_role: 'user', // Default to donor/user
        email: '',
        password: '',
        confirmPassword: '',

        // Profile data
        blood_type: '',
        phone: '',
        city: '',
        address: '',
        available: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            setSubmitting(true);

            // Transform data for API
            const registrationData = {
                email: formData.email,
                password: formData.password,
                role: formData.user_role,
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                address: formData.address,
                // Only include if donor
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
            // Error handled in AuthContext
            setSubmitting(false);
        }

    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    if (success) {
        return (
            <div className="register-page">
                <div className="container">
                    <div className="success-card glass-card">
                        <div className="success-icon">✓</div>
                        <h2>Registration Successful!</h2>
                        <p>Thank you for registering. You're now part of our lifesaving network.</p>
                        <p className="redirect-text">Redirecting...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            <div className="container">
                <div className="register-grid">
                    <div className="register-info">
                        <h1>Join the <span className="text-gradient">Blood Emergency</span> Platform</h1>
                        <p>Sign up to save lives, manage hospital requests, or coordinate blood banks.</p>

                        <div className="benefits-list">
                            <div className="benefit-item">
                                <span className="benefit-icon">USER</span>
                                <div>
                                    <h4>For Donors</h4>
                                    <p>Register to donate blood and save lives.</p>
                                </div>
                            </div>

                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <p>Already have an account? <Link to="/login" style={{ color: 'white', fontWeight: 'bold' }}>Login here</Link></p>
                        </div>
                    </div>

                    <div className="register-form-card glass-card">
                        <h2>Create Account</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Role Selection could go here, for now assumes Donor/User */}

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone *</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="+91 XXXXX XXXXX"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Blood Type *</label>
                                <div className="blood-type-selector">
                                    {bloodTypes.map(type => (
                                        <label
                                            key={type}
                                            className={`blood-type-option ${formData.blood_type === type ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="blood_type"
                                                value={type}
                                                checked={formData.blood_type === type}
                                                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                                required
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Your city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Optional"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formData.user_role === 'user' && (
                                <div className="form-group">
                                    <label className="availability-toggle">
                                        <input
                                            type="checkbox"
                                            checked={formData.available}
                                            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                        <span className="toggle-label">I'm available to donate now</span>
                                    </label>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-lg full-width" disabled={submitting}>
                                {submitting ? 'Registering...' : `Register as ${formData.user_role === 'user' ? 'Donor' : (formData.user_role === 'hospital' ? 'Hospital' : 'Blood Bank')}`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
