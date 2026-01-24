import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { useSocket, useCriticalAlerts } from '../hooks/useSocket';
import BloodTypeCard from '../components/BloodTypeCard';
import EmergencyBanner from '../components/EmergencyBanner';
import RequestCard from '../components/RequestCard';
import './Home.css';

function Home() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isConnected } = useSocket();
    const { alerts } = useCriticalAlerts();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getDashboard();
            setDashboard(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error: {error}</p>
                <button className="btn btn-primary" onClick={fetchDashboard}>Retry</button>
            </div>
        );
    }

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="home">
            {dashboard?.criticalRequests?.length > 0 && (
                <EmergencyBanner requests={dashboard.criticalRequests} />
            )}

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
                            {isConnected ? 'Live Updates Active' : 'Connecting...'}
                        </div>
                        <h1 className="hero-title">
                            Save Lives with <span className="text-gradient">Blood Donation</span>
                        </h1>
                        <p className="hero-subtitle">
                            Connect with donors, hospitals, and blood banks instantly.
                            Every second counts in an emergency.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Become a Donor
                            </Link>
                            <Link to="/emergency" className="btn btn-outline btn-lg">
                                Request Blood
                            </Link>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card glass-card">
                            <span className="stat-number">{dashboard?.donors?.total || 0}</span>
                            <span className="stat-label">Registered Donors</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-number">{dashboard?.donors?.available || 0}</span>
                            <span className="stat-label">Available Now</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-number">{dashboard?.hospitals?.total || 0}</span>
                            <span className="stat-label">Partner Hospitals</span>
                        </div>
                        <div className="stat-card glass-card critical">
                            <span className="stat-number">{dashboard?.requests?.pending || 0}</span>
                            <span className="stat-label">Pending Requests</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blood Types Section */}
            <section className="section blood-types-section">
                <div className="container">
                    <h2 className="section-title">Blood Type Availability</h2>
                    <p className="section-subtitle">
                        Find donors by blood type or check blood bank inventory
                    </p>

                    <div className="blood-types-grid">
                        {bloodTypes.map(type => (
                            <BloodTypeCard
                                key={type}
                                type={type}
                                count={dashboard?.donors?.byType?.[type] || 0}
                                available={true}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Critical Requests Section */}
            {dashboard?.criticalRequests?.length > 0 && (
                <section className="section critical-section">
                    <div className="container">
                        <h2 className="section-title">
                            <span className="pulse"></span>
                            Critical Requests
                        </h2>
                        <p className="section-subtitle">
                            These requests need immediate attention
                        </p>

                        <div className="requests-grid">
                            {dashboard.criticalRequests.slice(0, 3).map(request => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </div>

                        <div className="section-actions">
                            <Link to="/emergency" className="btn btn-outline">
                                View All Requests
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works Section */}
            <section className="section how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">
                        Simple steps to save a life
                    </p>

                    <div className="steps-grid">
                        <div className="step-card glass-card">
                            <div className="step-number">1</div>
                            <h3>Register</h3>
                            <p>Sign up as a blood donor with your blood type and contact details</p>
                        </div>
                        <div className="step-card glass-card">
                            <div className="step-number">2</div>
                            <h3>Get Notified</h3>
                            <p>Receive real-time alerts when your blood type is needed nearby</p>
                        </div>
                        <div className="step-card glass-card">
                            <div className="step-number">3</div>
                            <h3>Donate</h3>
                            <p>Visit the hospital or blood bank and donate to save lives</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-card glass-card">
                        <div className="cta-content">
                            <h2>Ready to Make a Difference?</h2>
                            <p>Join thousands of donors who are saving lives every day</p>
                        </div>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Register Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
