import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SkeletonDashboard from '../components/skeletons/SkeletonDashboard';
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
import BloodCampBulletin from '../components/BloodCampBulletin';
import DigitalArteryBackground from '../components/animations/DigitalArteryBackground';
import './Home.css';

// Animated Counter with smooth transitions
interface AnimatedNumberProps {
    value: number;
    duration?: number;
}
function AnimatedNumber({ value, duration = 2 }: AnimatedNumberProps) {
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
interface LiveStatsCounterProps {
    activeRequests: number;
    donorsOnline: number;
    livesSaved: number;
}
function LiveStatsCounter({ activeRequests, donorsOnline, livesSaved }: LiveStatsCounterProps) {
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
interface BloodGaugeProps {
    type: string;
    current: number;
    max?: number;
}
function BloodGauge({ type, current, max = 20 }: BloodGaugeProps) {
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
interface ImpactCardProps {
    icon: React.ElementType;
    value: number;
    label: string;
    delay: number;
}
function ImpactCard({ icon: Icon, value, label, delay }: ImpactCardProps) {
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

import { DashboardStats } from '../types';

function Home() {
    const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { isConnected } = useSocket();

    // Load cached dashboard if available
    useEffect(() => {
        const cached = localStorage.getItem('dashboard_cache');
        if (cached) {
            try {
                setDashboard(JSON.parse(cached));
                setLoading(false); // Show cached immediately
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getDashboard();
                setDashboard(response.data || null);
                localStorage.setItem('dashboard_cache', JSON.stringify(response.data));
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                // If we have no data at all (not even cached), keep loading false to show structure (or empty state)
                // but if we *do* have cached data, we just keep showing it.
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading && !dashboard) {
        return <SkeletonDashboard />;
    }

    const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    const activeRequests = dashboard?.requests?.pending || 0;
    const donorsOnline = dashboard?.donors?.available || 0;
    const livesSaved = dashboard?.requests?.fulfilled || 0;

    return (
        <PageTransition className="home-professional overflow-hidden">
            {/* Critical Banner */}
            {dashboard?.criticalRequests && dashboard.criticalRequests.length > 0 && (
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
                <DigitalArteryBackground />
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
                            The operating system for life-critical care. Connecting hospitals, donors,
                            and blood banks in real-time during medical emergencies.
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
                            <Link to="/enterprise" className="btn-enterprise-cta touch-target">
                                <Building2 size={20} />
                                For Enterprise
                            </Link>
                        </motion.div>

                        {/* Live Bulletin Board (Replaces Live Stats) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="w-full"
                        >
                            <BloodCampBulletin />
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

                    {/* Side Visual - Map Pulse (Removed as requested, or we can keep MapPulse background only) */}
                    <div className="hero-visual hide-mobile">
                        <div className="relative w-full h-full flex items-center justify-center opacity-50">
                            <MapPulseBackground />
                        </div>
                    </div>
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
        </PageTransition >
    );
}

export default Home;
