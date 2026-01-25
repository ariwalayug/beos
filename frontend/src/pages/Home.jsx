import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
    Activity,
    Heart,
    Building2,
    Users,
    ArrowRight,
    Shield,
    AlertTriangle,
    Droplet,
    CheckCircle,
    MapPin,
    Zap,
    Clock,
    BadgeCheck,
    Lock
} from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import './Home.css';

// Animated Counter with smooth transitions
function AnimatedNumber({ value, duration = 2 }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(count, value, { duration });
        const unsubscribe = rounded.on("change", latest => setDisplayValue(latest));
        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [value]);

    return <span>{displayValue.toLocaleString()}</span>;
}

// Heartbeat Wave Background
const HeartbeatWaveBackground = () => (
    <div className="heartbeat-wave-container">
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="heartbeat-wave">
            <motion.path
                d="M0,100 L200,100 L230,100 L250,20 L270,180 L290,60 L310,140 L330,100 L400,100 L1200,100 L1200,200 L0,200 Z"
                fill="url(#heartbeatGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
                <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(220, 38, 38, 0)" />
                    <stop offset="50%" stopColor="rgba(220, 38, 38, 0.3)" />
                    <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                </linearGradient>
            </defs>
        </svg>
        <motion.div
            className="pulse-ring"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
    </div>
);

// Map Pulse Background Effect
const MapPulseBackground = () => (
    <div className="map-pulse-container">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className="map-pulse-ring"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: "easeOut"
                }}
            />
        ))}
        <MapPin className="map-pulse-icon" size={32} />
    </div>
);

// Live Stats Counter Component
function LiveStatsCounter({ activeRequests, donorsOnline, livesSaved }) {
    return (
        <div className="live-stats-banner">
            <div className="live-indicator">
                <span className="live-dot" />
                <span className="live-text">LIVE</span>
            </div>
            <div className="live-stats-items">
                <div className="live-stat">
                    <Zap size={16} className="stat-icon critical" />
                    <span className="stat-value"><AnimatedNumber value={activeRequests} /></span>
                    <span className="stat-label">Active Requests</span>
                </div>
                <div className="stat-divider" />
                <div className="live-stat">
                    <Users size={16} className="stat-icon success" />
                    <span className="stat-value"><AnimatedNumber value={donorsOnline} /></span>
                    <span className="stat-label">Donors Online</span>
                </div>
                <div className="stat-divider" />
                <div className="live-stat">
                    <Heart size={16} className="stat-icon primary" />
                    <span className="stat-value"><AnimatedNumber value={livesSaved} /></span>
                    <span className="stat-label">Lives Saved</span>
                </div>
            </div>
        </div>
    );
}

// Trust Badges Component
function TrustBadges() {
    return (
        <div className="trust-badges">
            <div className="trust-badge verified">
                <BadgeCheck size={14} />
                <span>Verified Hospitals</span>
            </div>
            <div className="trust-badge secure">
                <Lock size={14} />
                <span>Secure Data</span>
            </div>
            <div className="trust-badge">
                <Shield size={14} />
                <span>Medical Partners</span>
            </div>
        </div>
    );
}

// Blood Supply Gauge
function BloodGauge({ type, current, max = 20 }) {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getStatus = () => {
        if (percentage >= 60) return { color: '#10b981', label: 'Healthy' };
        if (percentage >= 30) return { color: '#f59e0b', label: 'Low' };
        return { color: '#ef4444', label: 'Critical' };
    };

    const status = getStatus();

    return (
        <motion.div
            className="blood-gauge"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="gauge-ring relative">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <motion.circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={status.color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset: strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-400">{type}</span>
                    <span className="text-xl font-extrabold" style={{ color: status.color }}>{current}</span>
                </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: status.color }}>
                {status.label}
            </span>
        </motion.div>
    );
}

// Impact Stats Card with Hover Effect
function ImpactCard({ icon: Icon, value, label, delay }) {
    return (
        <motion.div
            className="impact-card relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="impact-icon-wrapper mb-3 p-3 rounded-lg bg-red-500/10 w-fit text-primary">
                <Icon size={24} />
            </div>
            <div className="impact-info">
                <div className="text-3xl font-bold mb-1">
                    <AnimatedNumber value={value} />
                </div>
                <span className="text-sm text-gray-400 uppercase tracking-wide">{label}</span>
            </div>
        </motion.div>
    );
}

function Home() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isConnected } = useSocket();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getDashboard();
                setDashboard(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <motion.div
                    className="loading-heart"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <Heart className="text-primary" size={48} fill="currentColor" />
                </motion.div>
                <p className="loading-message">Connecting to life-saving network...</p>
            </div>
        );
    }

    const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    const activeRequests = dashboard?.requests?.pending || 0;
    const donorsOnline = dashboard?.donors?.available || 0;
    const livesSaved = dashboard?.requests?.fulfilled || 0;

    return (
        <PageTransition className="home-professional overflow-hidden">
            {/* Critical Banner */}
            {dashboard?.criticalRequests?.length > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="critical-banner"
                >
                    <div className="container flex items-center justify-center gap-3">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <AlertTriangle size={20} />
                        </motion.div>
                        <span className="font-medium">
                            <strong>Critical Shortage:</strong> {dashboard.criticalRequests.length} urgent requests active.
                        </span>
                        <Link to="/emergency" className="flex items-center gap-1 underline hover:text-red-100">
                            View Requests <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Hero Section - Redesigned */}
            <section className="hero-section-new">
                <HeartbeatWaveBackground />
                <div className="hero-pulse-bg" />

                <div className="container hero-container">
                    <motion.div
                        className="hero-content-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Status Badge */}
                        <motion.div
                            className="hero-status-badge"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`} />
                            <span>Emergency Response Network Active</span>
                        </motion.div>

                        {/* Main Headline */}
                        <h1 className="hero-headline">
                            Find Blood.<br />
                            <span className="hero-headline-accent">Save Lives.</span><br />
                            <span className="hero-headline-urgent">Instantly.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="hero-subtitle-new">
                            Real-time blood donation platform connecting hospitals, donors, and blood banks
                            during medical emergencies. Every second counts.
                        </p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="hero-cta-group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link to="/emergency" className="btn-request-blood touch-target">
                                <Zap size={20} />
                                Request Blood
                            </Link>
                            <Link to="/register" className="btn-donate-now touch-target">
                                <Heart size={20} />
                                Donate Now
                            </Link>
                        </motion.div>

                        {/* Live Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <LiveStatsCounter
                                activeRequests={activeRequests}
                                donorsOnline={donorsOnline}
                                livesSaved={livesSaved}
                            />
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <TrustBadges />
                        </motion.div>
                    </motion.div>

                    {/* Side Visual - Map Pulse */}
                    <motion.div
                        className="hero-visual hide-mobile"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <MapPulseBackground />
                        <div className="hero-stats-floating">
                            <ImpactCard
                                icon={Users}
                                value={dashboard?.donors?.total || 0}
                                label="Active Donors"
                                delay={0.6}
                            />
                            <ImpactCard
                                icon={Building2}
                                value={dashboard?.hospitals?.total || 0}
                                label="Hospitals"
                                delay={0.7}
                            />
                            <ImpactCard
                                icon={Clock}
                                value={5}
                                label="Min Response"
                                delay={0.8}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Supply Dashboard */}
            <section className="section py-20 bg-zinc-900/50">
                <div className="container">
                    <FadeIn className="section-header flex items-center gap-4 mb-12">
                        <div className="p-3 bg-red-500/10 rounded-lg text-primary">
                            <Droplet size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">Network Inventory</h2>
                            <p className="text-gray-400">Real-time supply levels showing live data.</p>
                        </div>
                    </FadeIn>

                    <div className="gauges-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                        {bloodTypes.map((type, i) => (
                            <motion.div
                                key={type}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <BloodGauge
                                    type={type}
                                    current={dashboard?.donors?.byType?.[type] || 0}
                                    max={15}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Workflow */}
            <section className="section py-20">
                <div className="container">
                    <FadeIn className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-2">How It Works</h2>
                        <p className="text-gray-400">Streamlined process for rapid emergency response.</p>
                    </FadeIn>

                    <StaggerContainer className="process-grid flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                        <StaggerItem className="process-card flex-1 text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-500/50 transition-colors">
                            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">1. Register</h3>
                            <p className="text-gray-400 text-sm">Donors and hospitals join the secure network.</p>
                        </StaggerItem>

                        <div className="hidden md:block text-zinc-700"><ArrowRight size={32} /></div>

                        <StaggerItem className="process-card flex-1 text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-500/50 transition-colors">
                            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">2. Alert</h3>
                            <p className="text-gray-400 text-sm">Hospitals broadcast requirements instantly.</p>
                        </StaggerItem>

                        <div className="hidden md:block text-zinc-700"><ArrowRight size={32} /></div>

                        <StaggerItem className="process-card flex-1 text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-red-500/50 transition-colors">
                            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">3. Respond</h3>
                            <p className="text-gray-400 text-sm">Matched donors are notified and deployed.</p>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section py-16">
                <div className="container">
                    <motion.div
                        className="cta-emergency-box"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="cta-content">
                            <h3>Ready to Save Lives?</h3>
                            <p>Join thousands of donors making a difference every day.</p>
                        </div>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Join Network <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PageTransition>
    );
}

export default Home;
