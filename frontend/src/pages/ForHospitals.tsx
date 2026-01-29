import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Building2, Zap, Shield, BarChart3, Clock, Users,
    CheckCircle, ArrowRight, Play, Phone, Mail
} from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import { motion } from 'framer-motion';
import './ForHospitals.css';

function ForHospitals() {
    const [showDemo, setShowDemo] = useState(false);

    const features = [
        {
            icon: <Zap size={28} />,
            title: 'Real-Time Alerts',
            description: 'Broadcast blood needs instantly to 1000+ donors in your city.'
        },
        {
            icon: <BarChart3 size={28} />,
            title: 'AI Predictions',
            description: 'Forecast blood shortages 7 days in advance based on surgery schedules.'
        },
        {
            icon: <Users size={28} />,
            title: 'Donor Network',
            description: 'Access verified donors matched by blood type and proximity.'
        },
        {
            icon: <Clock size={28} />,
            title: 'Response Time',
            description: 'Average donor response in under 15 minutes for critical requests.'
        },
        {
            icon: <Shield size={28} />,
            title: 'Compliance Ready',
            description: 'HIPAA-compliant data handling with full audit trails.'
        },
        {
            icon: <Building2 size={28} />,
            title: 'Multi-Branch',
            description: 'Manage inventory across all your hospital locations.'
        }
    ];

    const stats = [
        { value: '50+', label: 'Partner Hospitals' },
        { value: '10,000+', label: 'Active Donors' },
        { value: '<15min', label: 'Avg Response' },
        { value: '99.9%', label: 'Uptime SLA' }
    ];

    const testimonials = [
        {
            quote: "BEOS cut our blood sourcing time from 4 hours to 20 minutes. It's a game-changer for emergency surgeries.",
            author: "Dr. Rajesh Patel",
            role: "Chief Medical Officer",
            hospital: "Sterling Hospital, Ahmedabad"
        },
        {
            quote: "The AI prediction feature helped us prevent 3 blood shortages last month alone.",
            author: "Ms. Priya Shah",
            role: "Blood Bank Director",
            hospital: "Civil Hospital, Surat"
        }
    ];

    return (
        <PageTransition className="for-hospitals-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <FadeIn className="hero-content">
                        <div className="hero-badge">
                            <Building2 size={16} />
                            <span>Enterprise Solutions</span>
                        </div>
                        <h1>
                            Blood Management.<br />
                            <span className="text-gradient">Redefined.</span>
                        </h1>
                        <p className="hero-subtitle">
                            BEOS transforms how hospitals source, track, and manage blood supply.
                            Real-time donor networks. AI-powered predictions. Zero shortages.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Start Free Trial <ArrowRight size={20} />
                            </Link>
                            <button className="btn btn-outline btn-lg" onClick={() => setShowDemo(true)}>
                                <Play size={20} /> Watch Demo
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Stats Banner */}
            <section className="stats-banner">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="container">
                    <FadeIn className="section-header">
                        <h2>Everything You Need to Eliminate Blood Shortages</h2>
                        <p>Purpose-built for hospital operations</p>
                    </FadeIn>

                    <div className="features-grid">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                className="feature-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROI Section */}
            <section className="roi-section">
                <div className="container">
                    <div className="roi-grid">
                        <FadeIn className="roi-content">
                            <h2>Proven ROI for Healthcare</h2>
                            <ul className="roi-list">
                                <li><CheckCircle size={20} /> 60% reduction in blood wastage</li>
                                <li><CheckCircle size={20} /> 75% faster emergency response</li>
                                <li><CheckCircle size={20} /> ₹5 Lakh+ annual savings per hospital</li>
                                <li><CheckCircle size={20} /> Zero stockouts in 6 months</li>
                            </ul>
                            <Link to="/pricing" className="btn btn-secondary">
                                View Pricing <ArrowRight size={18} />
                            </Link>
                        </FadeIn>
                        <div className="roi-visual">
                            <div className="roi-card glass-card">
                                <h4>Before BEOS</h4>
                                <div className="roi-metric negative">
                                    <span>4+ hours</span>
                                    <small>Average blood sourcing time</small>
                                </div>
                            </div>
                            <div className="roi-card glass-card highlight">
                                <h4>With BEOS</h4>
                                <div className="roi-metric positive">
                                    <span>15 min</span>
                                    <small>Average blood sourcing time</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <div className="container">
                    <FadeIn className="section-header">
                        <h2>Trusted by Leading Hospitals</h2>
                    </FadeIn>
                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                className="testimonial-card glass-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                viewport={{ once: true }}
                            >
                                <p className="quote">"{t.quote}"</p>
                                <div className="author">
                                    <strong>{t.author}</strong>
                                    <span>{t.role}</span>
                                    <span className="hospital">{t.hospital}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass-card">
                        <h2>Ready to Transform Your Blood Management?</h2>
                        <p>Schedule a personalized demo with our healthcare solutions team.</p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Start 14-Day Free Trial
                            </Link>
                            <a href="mailto:enterprise@beos.health" className="btn btn-outline btn-lg">
                                <Mail size={18} /> Contact Sales
                            </a>
                        </div>
                        <div className="cta-contact">
                            <a href="tel:+919876543210"><Phone size={16} /> +91 98765 43210</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Modal */}
            {showDemo && (
                <div className="demo-modal" onClick={() => setShowDemo(false)}>
                    <div className="demo-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowDemo(false)}>×</button>
                        <div className="demo-placeholder">
                            <Play size={64} />
                            <p>Demo video coming soon</p>
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}

export default ForHospitals;
