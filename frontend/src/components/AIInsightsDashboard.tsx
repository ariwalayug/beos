import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    TrendingUp,
    ArrowRight,
    Activity,
    Clock,
    CheckCircle
} from 'lucide-react';

interface Insight {
    type: 'critical' | 'urgent' | 'warning' | 'success' | 'info';
    icon: string;
    title: string;
    message: string;
    action: string | null;
    action_link: string | null;
}

interface AIInsightsDashboardProps {
    insights: Insight[];
    loading?: boolean;
}

const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => {
    const navigate = useNavigate();

    const getColors = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-red-500/10 border-red-500/50 text-red-500';
            case 'urgent': return 'bg-orange-500/10 border-orange-500/50 text-orange-500';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500';
            case 'success': return 'bg-green-500/10 border-green-500/50 text-green-500';
            default: return 'bg-blue-500/10 border-blue-500/50 text-blue-500';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="w-5 h-5" />;
            case 'urgent': return <Clock className="w-5 h-5" />;
            case 'warning': return <Activity className="w-5 h-5" />;
            case 'success': return <CheckCircle className="w-5 h-5" />;
            default: return <TrendingUp className="w-5 h-5" />;
        }
    };

    const colors = getColors(insight.type);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${colors} flex flex-col gap-3 relative overflow-hidden`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    {getIcon(insight.type)}
                    <span>{insight.title}</span>
                </div>
                <span className="text-xs uppercase tracking-wider font-bold opacity-70 border border-current px-2 py-0.5 rounded-full">
                    AI Generated
                </span>
            </div>

            <p className="text-sm opacity-90 leading-relaxed">
                {insight.message}
            </p>

            {insight.action && (
                <button
                    onClick={() => insight.action_link && navigate(insight.action_link)}
                    className="mt-auto self-start flex items-center gap-1 text-sm font-medium hover:underline underline-offset-4"
                >
                    {insight.action} <ArrowRight className="w-3 h-3" />
                </button>
            )}

            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
                <TrendingUp className="w-24 h-24" />
            </div>
        </motion.div>
    );
};

const AIInsightsDashboard = ({ insights, loading }: AIInsightsDashboardProps) => {
    const { user } = useAuth();

    if (!user || (user.role !== 'admin' && user.role !== 'hospital')) return null;

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-zinc-900/50 rounded-lg animate-pulse border border-zinc-800" />
                ))}
            </div>
        );
    }

    if (insights.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">AI Command Center</h2>
                    <p className="text-sm text-zinc-400">Real-time predictive insights & alerts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} index={index} />
                ))}
            </div>
        </div>
    );
};

export default AIInsightsDashboard;
