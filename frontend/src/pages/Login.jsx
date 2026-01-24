import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css'; // Reusing Register CSS for simplicity

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const success = await login(formData.email, formData.password);
            if (!success) setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <div className="container">
                <div className="register-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '500px', margin: '0 auto' }}>
                    <div className="register-form-card glass-card">
                        <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
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
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg full-width" disabled={submitting}>
                                {submitting ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
