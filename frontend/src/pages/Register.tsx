import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Lock, Phone, MapPin,
    Building2, Activity,
    CheckCircle, ArrowRight, ArrowLeft, AlertCircle
} from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            setSubmitting(true);
            const registrationData = { ...formData, role: formData.user_role };
            await register(registrationData);
            setSuccess(true);
            setTimeout(() => {
                const routes = {
                    admin: '/admin-dashboard',
                    hospital: '/hospital-dashboard',
                    blood_bank: '/blood-bank-dashboard',
                    user: '/donor-dashboard'
                };
                navigate(routes[formData.user_role] || '/donor-dashboard');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Registration failed');
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        setError('');
        if (step === 1 && !formData.user_role) return setError('Please select a role');
        if (step === 2 && formData.user_role === 'user' && !formData.blood_type) return setError('Select blood type');
        setStep(current => current + 1);
    };

    if (success) {
        return (
            <PageTransition className="auth-page professional">
                <motion.div
                    className="success-card-pro"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="icon-circle">
                        <CheckCircle size={48} className="text-success" />
                    </div>
                    <h2>Registration Complete</h2>
                    <p>Redirecting to your dashboard...</p>
                </motion.div>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="auth-page professional">
            <div className="register-container-pro">
                <div className="register-header">
                    <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link>
                    <div className="step-indicator-pro">
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className="step-connector"></div>
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                        <div className="step-connector"></div>
                        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                </div>

                <div className="register-card-pro">
                    <div className="card-header-pro">
                        <h2>
                            {step === 1 && 'Select Account Type'}
                            {step === 2 && 'Profile Details'}
                            {step === 3 && 'Security Credentials'}
                        </h2>
                        <p>Step {step} of 3</p>
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

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="role-grid-pro"
                                >
                                    {/* Role Cards */}
                                    {['user', 'hospital', 'blood_bank'].map(role => (
                                        <label key={role} className={`role-card ${formData.user_role === role ? 'selected' : ''}`}>
                                            <input type="radio" name="role" value={role} checked={formData.user_role === role} onChange={(e) => setFormData({ ...formData, user_role: e.target.value })} />
                                            {role === 'user' && <User size={32} />}
                                            {role === 'hospital' && <Building2 size={32} />}
                                            {role === 'blood_bank' && <Activity size={32} />}
                                            <h3>{role === 'user' ? 'Donor' : role === 'hospital' ? 'Hospital' : 'Blood Bank'}</h3>
                                            <p>{role === 'user' ? 'Individual' : role === 'hospital' ? 'Medical Center' : 'Inventory'}</p>
                                        </label>
                                    ))}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="form-grid"
                                >
                                    <div className="form-group-pro">
                                        <label>Full Name / Organization</label>
                                        <div className="input-wrapper">
                                            <User size={18} className="input-icon" />
                                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" required />
                                        </div>
                                    </div>

                                    {formData.user_role === 'user' && (
                                        <div className="form-group-pro">
                                            <label>Blood Type</label>
                                            <div className="blood-grid-mini">
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                    <label key={type} className={`blood-chip ${formData.blood_type === type ? 'selected' : ''}`}>
                                                        <input type="radio" name="blood_type" value={type} checked={formData.blood_type === type} onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })} />
                                                        {type}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-row two-col">
                                        <div className="form-group-pro">
                                            <label>City</label>
                                            <div className="input-wrapper">
                                                <MapPin size={18} className="input-icon" />
                                                <select
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    required
                                                    className="select-input"
                                                >
                                                    <option value="">Select City</option>
                                                    <option value="Ahmedabad">Ahmedabad</option>
                                                    <option value="Surat">Surat</option>
                                                    <option value="Vadodara">Vadodara</option>
                                                    <option value="Rajkot">Rajkot</option>
                                                    <option value="Gandhinagar">Gandhinagar</option>
                                                    <option value="Bhavnagar">Bhavnagar</option>
                                                    <option value="Jamnagar">Jamnagar</option>
                                                    <option value="Junagadh">Junagadh</option>
                                                    <option value="Anand">Anand</option>
                                                    <option value="Nadiad">Nadiad</option>
                                                    <option value="Mehsana">Mehsana</option>
                                                    <option value="Bhuj">Bhuj</option>
                                                    <option value="Morbi">Morbi</option>
                                                    <option value="Valsad">Valsad</option>
                                                    <option value="Patan">Patan</option>
                                                    <option value="Navsari">Navsari</option>
                                                    <option value="Bharuch">Bharuch</option>
                                                    <option value="Surendranagar">Surendranagar</option>
                                                    <option value="Porbandar">Porbandar</option>
                                                    <option value="Godhra">Godhra</option>
                                                    <option value="Palanpur">Palanpur</option>
                                                    <option value="Veraval">Veraval</option>
                                                    <option value="Dahod">Dahod</option>
                                                    <option value="Botad">Botad</option>
                                                    <option value="Amreli">Amreli</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group-pro">
                                            <label>Phone</label>
                                            <div className="input-wrapper">
                                                <Phone size={18} className="input-icon" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setFormData({ ...formData, phone: value });
                                                    }}
                                                    placeholder="10-digit mobile number"
                                                    pattern="[0-9]{10}"
                                                    maxLength={10}
                                                    title="Please enter exactly 10 digits"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="form-grid"
                                >
                                    <div className="form-group-pro">
                                        <label>Email Address</label>
                                        <div className="input-wrapper">
                                            <Mail size={18} className="input-icon" />
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group-pro">
                                        <label>Password</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group-pro">
                                        <label>Confirm Password</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="form-actions-pro">
                            {step > 1 && (
                                <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Continue <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Account'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
}

export default Register;
