import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { useSocket, useCriticalAlerts } from '../hooks/useSocket';
import EmergencyBanner from '../components/EmergencyBanner';
import RequestCard from '../components/RequestCard';
import './Home.css';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
        const startTime = Date.now();
        const startValue = 0;
        const endValue = parseInt(end) || 0;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

            setCount(current);

            if (progress < 1) {
                countRef.current = requestAnimationFrame(animate);
            }
        };

        countRef.current = requestAnimationFrame(animate);

        return () => {
            if (countRef.current) {
                cancelAnimationFrame(countRef.current);
            }
        };
    }, [end, duration]);

    return <span>{count}{suffix}</span>;
}

// Blood Supply Gauge Component (SVG Ring)
function BloodGauge({ type, current, max = 20, isLoading }) {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getStatus = () => {
        if (percentage >= 60) return { color: '#22c55e', label: 'Healthy', glow: 'rgba(34, 197, 94, 0.4)' };
        if (percentage >= 30) return { color: '#f59e0b', label: 'Low', glow: 'rgba(245, 158, 11, 0.4)' };
        return { color: '#ef4444', label: 'Critical', glow: 'rgba(239, 68, 68, 0.6)' };
    };

    const status = getStatus();

    return (
        <div className="blood-gauge">
            <div className="gauge-ring" style={{ '--glow-color': status.glow }}>
                <svg viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={status.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={isLoading ? circumference : strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        className="gauge-progress"
                        style={{ '--target-offset': strokeDashoffset }}
                    />
                </svg>
                <div className="gauge-content">
                    <span className="gauge-type">{type}</span>
                    <span className="gauge-count" style={{ color: status.color }}>
                        {isLoading ? '-' : current}
                    </span>
                </div>
            </div>
            <span className="gauge-label" style={{ color: status.color }}>{status.label}</span>
        </div>
    );
}

// Live Pulse Visualization
function LivePulse({ isConnected, criticalCount }) {
    return (
        <div className="live-pulse-container">
            <div className={`pulse-core ${criticalCount > 0 ? 'critical' : ''}`}>
                <div className="pulse-ring ring-1"></div>
                <div className="pulse-ring ring-2"></div>
                <div className="pulse-ring ring-3"></div>
                <div className="pulse-center">
                    <span className="heartbeat">❤️</span>
                </div>
            </div>
            <div className="pulse-status">
                <span className={`status-indicator ${isConnected ? 'online' : ''}`}>
                    <span className="dot"></span>
                    {isConnected ? 'LIVE' : 'CONNECTING'}
                </span>
                {criticalCount > 0 && (
                    <span className="alert-count">{criticalCount} CRITICAL</span>
                )}
            </div>
        </div>
    );
}

// Impact Stats Card
function ImpactCard({ icon, value, label, delay = 0 }) {
    return (
        <div className="impact-card glass-card" style={{ animationDelay: `${delay}ms` }}>
            <span className="impact-icon">{icon}</span>
            <div className="impact-value">
                <AnimatedCounter end={value} duration={2500} />
            </div>
            <span className="impact-label">{label}</span>
        </div>
    );
}

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
                <div className="loading-pulse">
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                </div>
                <p>Initializing Network...</p>
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

    const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

    return (
        <div className="home masterpiece">
            {dashboard?.criticalRequests?.length > 0 && (
                <EmergencyBanner requests={dashboard.criticalRequests} />
            )}

            {/* Ultra-Premium Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="grid-overlay"></div>
                </div>

                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <div className="hero-badge animate-slide-up">
                                <LivePulse
                                    isConnected={isConnected}
                                    criticalCount={dashboard?.criticalRequests?.length || 0}
                                />
                            </div>

                            <h1 className="hero-title animate-slide-up delay-1">
                                Be the Reason
                                <span className="text-gradient-animated"> a Heart Keeps Beating</span>
                            </h1>

                            <p className="hero-subtitle animate-slide-up delay-2">
                                Join the First Responder Network. Every second counts when someone needs blood.
                                Your donation can save up to 3 lives.
                            </p>

                            <div className="hero-actions animate-slide-up delay-3">
                                <Link to="/register" className="btn btn-hero-primary">
                                    <span className="btn-glow"></span>
                                    <span className="btn-text">🦸 Become a Hero</span>
                                </Link>
                                <Link to="/emergency" className="btn btn-hero-secondary">
                                    <span className="btn-text">🚨 Emergency Request</span>
                                </Link>
                            </div>
                        </div>

                        {/* Impact Stats */}
                        <div className="impact-stats animate-fade-in delay-2">
                            <ImpactCard
                                icon="🦸"
                                value={dashboard?.donors?.total || 0}
                                label="Registered Heroes"
                                delay={0}
                            />
                            <ImpactCard
                                icon="💚"
                                value={dashboard?.donors?.available || 0}
                                label="Ready to Respond"
                                delay={100}
                            />
                            <ImpactCard
                                icon="🏥"
                                value={dashboard?.hospitals?.total || 0}
                                label="Partner Hospitals"
                                delay={200}
                            />
                            <ImpactCard
                                icon="❤️‍🩹"
                                value={dashboard?.requests?.fulfilled || 0}
                                label="Lives Saved"
                                delay={300}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Blood Supply Gauges Section */}
            <section className="section supply-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">🩸</span>
                            Blood Supply Status
                        </h2>
                        <p className="section-subtitle">
                            Real-time inventory across the network • Updated every minute
                        </p>
                    </div>

                    <div className="gauges-grid">
                        {bloodTypes.map((type, idx) => (
                            <BloodGauge
                                key={type}
                                type={type}
                                current={dashboard?.donors?.byType?.[type] || 0}
                                max={15}
                                isLoading={loading}
                            />
                        ))}
                    </div>

                    <div className="supply-legend">
                        <span className="legend-item healthy">
                            <span className="legend-dot"></span> Healthy (60%+)
                        </span>
                        <span className="legend-item low">
                            <span className="legend-dot"></span> Low (30-60%)
                        </span>
                        <span className="legend-item critical">
                            <span className="legend-dot"></span> Critical (&lt;30%)
                        </span>
                    </div>
                </div>
            </section>

            {/* Critical Requests Section */}
            {dashboard?.criticalRequests?.length > 0 && (
                <section className="section critical-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">
                                <span className="pulse-dot critical"></span>
                                Critical Requests
                            </h2>
                            <p className="section-subtitle">
                                These patients need blood urgently
                            </p>
                        </div>

                        <div className="requests-grid">
                            {dashboard.criticalRequests.slice(0, 3).map(request => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </div>

                        <div className="section-actions">
                            <Link to="/emergency" className="btn btn-outline">
                                View All Requests →
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works Section */}
            <section className="section how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">⚡</span>
                            How It Works
                        </h2>
                        <p className="section-subtitle">
                            Three simple steps to become a First Responder
                        </p>
                    </div>

                    <div className="steps-timeline">
                        <div className="timeline-line"></div>

                        <div className="step-card glass-card">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Register as a Hero</h3>
                                <p>Sign up with your blood type and location. It takes less than 2 minutes.</p>
                            </div>
                            <div className="step-icon">📝</div>
                        </div>

                        <div className="step-card glass-card">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Get Real-Time Alerts</h3>
                                <p>Receive instant notifications when your blood type is needed nearby.</p>
                            </div>
                            <div className="step-icon">🔔</div>
                        </div>

                        <div className="step-card glass-card">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Respond & Save Lives</h3>
                                <p>Visit the hospital, donate, and track the impact of your contribution.</p>
                            </div>
                            <div className="step-icon">❤️</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-card-premium glass-card">
                        <div className="cta-bg">
                            <div className="cta-orb"></div>
                        </div>
                        <div className="cta-content">
                            <span className="cta-badge">🌟 Join 10,000+ Heroes</span>
                            <h2>Ready to Make a Difference?</h2>
                            <p>One donation can save up to 3 lives. Be the hero someone is waiting for.</p>
                        </div>
                        <Link to="/register" className="btn btn-cta">
                            <span className="btn-glow"></span>
                            <span className="btn-text">Register Now →</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
