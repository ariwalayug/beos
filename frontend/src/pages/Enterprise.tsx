import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Zap, Building2, TrendingUp, Shield, Globe, Clock,
    Activity, MapPin, Brain, Truck, ArrowRight, Mail,
    Phone, BarChart3, Users
} from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import './Enterprise.css';

function Enterprise() {
    const stakeholders = [
        {
            icon: <Building2 size={28} />,
            iconClass: 'hospital',
            title: 'For Hospital Directors',
            subtitle: 'Operational Excellence',
            value: 'Stop losing time to coordination chaos. BEOS delivers compatible donors to your emergency requests in seconds—not hours. Unified inventory across all branches, AI-powered shortage predictions, and instant emergency broadcasts.',
            cta: 'See Hospital Solutions',
            link: '/for-hospitals'
        },
        {
            icon: <TrendingUp size={28} />,
            iconClass: 'investor',
            title: 'For Investors',
            subtitle: 'Market Opportunity',
            value: 'Healthcare logistics is a $100B+ market running on paper and phone calls. BEOS is the infrastructure layer that digitizes life-critical supply chains. First-mover advantage in healthcare emergency coordination SaaS.',
            cta: 'View Investment Deck',
            link: '/pricing'
        },
        {
            icon: <Shield size={28} />,
            iconClass: 'government',
            title: 'For Government Health Authorities',
            subtitle: 'National Oversight',
            value: 'National blood reserve visibility. Predictive shortage alerts. Audit-ready compliance tracking. One platform to protect your population with city-wide or state-level deployment options.',
            cta: 'Government Solutions',
            link: '/for-government'
        }
    ];

    const capabilities = [
        {
            icon: <Globe size={24} />,
            title: 'Real-Time Healthcare Network',
            description: 'Instantly connect hospitals, blood banks, donors, and emergency services into a unified operating network.'
        },
        {
            icon: <Brain size={24} />,
            title: 'AI Demand Prediction',
            description: 'Forecast blood shortages 7 days in advance using surgery schedules, seasonal patterns, and historical data.'
        },
        {
            icon: <MapPin size={24} />,
            title: 'Live Geospatial Maps',
            description: 'Interactive maps showing donor locations, blood banks, and hospitals for geographic proximity matching.'
        },
        {
            icon: <Activity size={24} />,
            title: 'Organ Viability Tracking',
            description: 'Time-critical tracking for organ transport with real-time viability countdown and logistics coordination.'
        },
        {
            icon: <Truck size={24} />,
            title: 'Emergency Logistics',
            description: 'Coordinate blood and organ transport with integrated logistics providers and drone delivery network support.'
        },
        {
            icon: <BarChart3 size={24} />,
            title: 'Analytics Dashboard',
            description: 'Real-time KPIs, response time metrics, inventory health, and operational performance tracking.'
        }
    ];

    const trustStats = [
        { value: '99.9%', label: 'Uptime SLA' },
        { value: 'HIPAA', label: 'Compliant' },
        { value: '<15min', label: 'Avg Response' },
        { value: '24/7', label: 'Support' }
    ];

    return (
        <PageTransition className="enterprise-page">
            {/* Hero Section */}
            <section className="enterprise-hero">
                <div className="container">
                    <FadeIn>
                        <motion.div
                            className="enterprise-badge"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Zap size={16} />
                            <span>Enterprise Healthcare Platform</span>
                        </motion.div>

                        <h1>
                            BEOS: The Operating System<br />
                            for <span className="accent">Life-Critical Care</span>
                        </h1>

                        <p className="vision-statement">
                            When every second counts, <strong>chaos is not a strategy</strong>.
                            BEOS replaces fragmented phone calls, guesswork, and outdated inventory sheets
                            with a <strong>unified real-time command platform</strong> that instantly connects
                            hospitals, blood banks, and donors into one intelligent network.
                        </p>

                        <div className="hero-cta-row">
                            <Link to="/register" className="btn-enterprise primary">
                                <Zap size={20} />
                                Start Free Trial
                            </Link>
                            <a href="mailto:enterprise@beos.health" className="btn-enterprise outline">
                                <Mail size={20} />
                                Contact Sales
                            </a>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Trust Signals */}
            <section className="trust-section">
                <div className="container">
                    <div className="trust-grid">
                        {trustStats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="trust-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <span className="value">{stat.value}</span>
                                <span className="label">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stakeholder Cards */}
            <section className="stakeholder-section">
                <div className="container">
                    <FadeIn className="section-header">
                        <h2>Built for Healthcare Leaders</h2>
                        <p>Enterprise-grade solutions for every stakeholder in the healthcare ecosystem</p>
                    </FadeIn>

                    <div className="stakeholder-grid">
                        {stakeholders.map((s, i) => (
                            <motion.div
                                key={i}
                                className="stakeholder-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15 }}
                                viewport={{ once: true }}
                            >
                                <div className={`stakeholder-icon ${s.iconClass}`}>
                                    {s.icon}
                                </div>
                                <h3>{s.title}</h3>
                                <p className="subtitle">{s.subtitle}</p>
                                <p className="value-prop">{s.value}</p>
                                <Link to={s.link} className="stakeholder-cta">
                                    {s.cta} <ArrowRight size={16} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities Grid */}
            <section className="capabilities-section">
                <div className="container">
                    <FadeIn className="section-header">
                        <h2>Enterprise Capabilities</h2>
                        <p>A complete operating system for healthcare emergency response</p>
                    </FadeIn>

                    <div className="capabilities-grid">
                        {capabilities.map((cap, i) => (
                            <motion.div
                                key={i}
                                className="capability-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                viewport={{ once: true }}
                            >
                                <div className="capability-icon">
                                    {cap.icon}
                                </div>
                                <h4>{cap.title}</h4>
                                <p>{cap.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="enterprise-cta">
                <div className="container">
                    <motion.div
                        className="cta-box"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>We don't just manage blood banks.</h2>
                        <p>We orchestrate the emergency response that saves lives.</p>
                        <div className="cta-buttons">
                            <Link to="/register" className="btn-enterprise primary">
                                Start 14-Day Free Trial
                            </Link>
                            <a href="tel:+919876543210" className="btn-enterprise outline">
                                <Phone size={18} />
                                +91 98765 43210
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PageTransition>
    );
}

export default Enterprise;
