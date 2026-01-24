import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { useSocket, useCriticalAlerts } from '../hooks/useSocket';
import {
    Activity,
    Heart,
    Building2,
    Users,
    ArrowRight,
    Shield,
    AlertTriangle,
    Droplet,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import StaggerContainer, { StaggerItem } from '../components/animations/StaggerContainer';
import './Home.css';

// SVG Network Animation Background
const NetworkBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
            <motion.path
                d="M100,400 Q250,300 400,400 T700,400 T900,300"
                fill="none"
                stroke="#e11d48"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path
                d="M50,200 Q300,500 600,200 T950,500"
                fill="none"
                stroke="#be123c"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 4, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.circle cx="400" cy="400" r="10" fill="#e11d48"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle cx="700" cy="400" r="6" fill="#be123c"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
            />
        </svg>
    </div>
);

// Animated Counter
function AnimatedCounter({ end, duration = 2 }) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        >
            {end}
        </motion.span>
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
                    <AnimatedCounter end={value} />
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
            <div className="h-screen flex items-center justify-center bg-zinc-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Activity className="text-primary" size={48} />
                </motion.div>
            </div>
        );
    }

    const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

    return (
        <PageTransition className="home-professional overflow-hidden">
            {/* Critical Banner */}
            {dashboard?.criticalRequests?.length > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="critical-banner bg-red-700 text-white py-3"
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

            {/* Hero Section */}
            <section className="hero-section relative min-h-[90vh] flex items-center pt-20">
                <NetworkBackground />
                <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-content"
                    >
                        <motion.div
                            className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-gray-400 mb-6"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                            System Operational
                        </motion.div>

                        <h1 className="hero-title text-5xl md:text-7xl font-black leading-tight mb-6">
                            Advanced Blood<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">
                                Logistics Network
                            </span>
                        </h1>

                        <p className="hero-subtitle text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
                            Connecting hospitals, donors, and logistics in real-time.
                            The next generation of emergency response infrastructure is here.
                        </p>

                        <motion.div
                            className="hero-actions flex gap-4"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Link to="/register" className="btn btn-primary btn-lg flex items-center gap-2 group">
                                Join Network
                                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    <ArrowRight size={20} />
                                </motion.span>
                            </Link>
                            <Link to="/emergency" className="btn btn-secondary btn-lg flex items-center gap-2">
                                <Activity size={20} /> View Activity
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="hero-stats-grid grid grid-cols-2 gap-4"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        <ImpactCard
                            icon={Users}
                            value={dashboard?.donors?.total || 0}
                            label="Active Donors"
                            delay={0.1}
                        />
                        <ImpactCard
                            icon={Building2}
                            value={dashboard?.hospitals?.total || 0}
                            label="Hospitals"
                            delay={0.2}
                        />
                        <ImpactCard
                            icon={Heart}
                            value={dashboard?.donors?.available || 0}
                            label="Available Now"
                            delay={0.3}
                        />
                        <ImpactCard
                            icon={Shield}
                            value={dashboard?.requests?.fulfilled || 0}
                            label="Fulfilled"
                            delay={0.4}
                        />
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

            {/* Workflow */}
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
        </PageTransition>
    );
}

export default Home;
