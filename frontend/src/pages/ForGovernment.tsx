import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield, Globe, BarChart3, Users, Building2, Map,
    AlertTriangle, FileCheck, ArrowRight, Phone, Mail,
    Activity, Clock, CheckCircle, Zap
} from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import './ForGovernment.css';

function ForGovernment() {
    const features = [
        {
            icon: <Globe size={28} />,
            title: 'National Blood Reserve Visibility',
            description: 'Real-time dashboard showing blood inventory across all hospitals and blood banks in your jurisdiction.'
        },
        {
            icon: <AlertTriangle size={28} />,
            title: 'Predictive Shortage Alerts',
            description: 'AI-powered forecasting identifies potential shortages 7 days in advance, enabling proactive donor drives.'
        },
        {
            icon: <FileCheck size={28} />,
            title: 'Compliance & Audit Trails',
            description: 'Complete audit logs for every blood unit from collection to transfusion. HIPAA-compliant data handling.'
        },
        {
            icon: <Map size={28} />,
            title: 'Geospatial Command Center',
            description: 'Interactive maps showing emergency requests, donor distribution, and transport logistics in real-time.'
        },
        {
            icon: <Activity size={28} />,
            title: 'Mass Casualty Response',
            description: 'Coordinate multi-hospital response during disasters with centralized resource allocation and communication.'
        },
        {
            icon: <BarChart3 size={28} />,
            title: 'Public Health Analytics',
            description: 'Aggregate data on blood type distribution, donation rates, and regional health metrics for policy planning.'
        }
    ];

    const deploymentOptions = [
        {
            title: 'City-Wide Network',
            description: 'Connect all hospitals and blood banks within a metropolitan area.',
            icon: <Building2 size={24} />
        },
        {
            title: 'State-Level Deployment',
            description: 'Unified oversight across all districts with regional command centers.',
            icon: <Map size={24} />
        },
        {
            title: 'National Integration',
            description: 'Full-scale deployment with federal health ministry integration.',
            icon: <Globe size={24} />
        }
    ];

    const stats = [
        { value: '50+', label: 'Cities Deployed' },
        { value: '500+', label: 'Hospitals Connected' },
        { value: '1M+', label: 'Lives Impacted' },
        { value: '99.9%', label: 'Uptime Guaranteed' }
    ];

    return (
        <PageTransition className="for-government-page">
            {/* Hero Section */}
            <section className="gov-hero">
                <div className="container">
                    <FadeIn className="hero-content">
                        <div className="gov-badge">
                            <Shield size={16} />
                            <span>Government Solutions</span>
                        </div>
                        <h1>
                            National Emergency<br />
                            <span className="text-gradient">Readiness. One Platform.</span>
                        </h1>
                        <p className="hero-subtitle">
                            BEOS empowers government health authorities with real-time visibility,
                            predictive analytics, and coordinated response capabilities across your
                            entire healthcare network.
                        </p>
                        <div className="hero-actions">
                            <a href="mailto:government@beos.health" className="btn btn-primary btn-lg">
                                <Mail size={20} /> Request Government Demo
                            </a>
                            <Link to="/enterprise" className="btn btn-outline btn-lg">
                                Enterprise Overview <ArrowRight size={18} />
                            </Link>
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
                        <h2>Complete Government Oversight</h2>
                        <p>Purpose-built for public health administration</p>
                    </FadeIn>

                    <div className="features-grid">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deployment Options */}
            <section className="deployment-section">
                <div className="container">
                    <FadeIn className="section-header">
                        <h2>Flexible Deployment Options</h2>
                        <p>Scale from city networks to national infrastructure</p>
                    </FadeIn>

                    <div className="deployment-grid">
                        {deploymentOptions.map((option, i) => (
                            <motion.div
                                key={i}
                                className="deployment-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                viewport={{ once: true }}
                            >
                                <div className="deployment-icon">{option.icon}</div>
                                <h3>{option.title}</h3>
                                <p>{option.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="container">
                    <div className="benefits-grid">
                        <FadeIn className="benefits-content">
                            <h2>Why Government Agencies Choose BEOS</h2>
                            <ul className="benefits-list">
                                <li><CheckCircle size={20} /> Reduce emergency response time by 75%</li>
                                <li><CheckCircle size={20} /> Prevent regional blood shortages before they occur</li>
                                <li><CheckCircle size={20} /> Full regulatory compliance and audit trails</li>
                                <li><CheckCircle size={20} /> Coordinate across multiple jurisdictions seamlessly</li>
                                <li><CheckCircle size={20} /> Data-driven policy planning with real analytics</li>
                            </ul>
                        </FadeIn>
                        <div className="benefits-visual">
                            <div className="visual-card">
                                <Zap size={32} className="text-primary" />
                                <h4>Emergency Coordination</h4>
                                <p>When disaster strikes, BEOS enables unified command across all facilities.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Protect Your Population with BEOS</h2>
                        <p>Schedule a consultation with our government solutions team to discuss your jurisdiction's needs.</p>
                        <div className="cta-actions">
                            <a href="mailto:government@beos.health" className="btn btn-primary btn-lg">
                                Request Government Demo
                            </a>
                            <a href="tel:+919876543210" className="btn btn-outline btn-lg">
                                <Phone size={18} /> +91 98765 43210
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </PageTransition>
    );
}

export default ForGovernment;
