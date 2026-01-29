import { motion } from 'framer-motion';
import { Clock, Navigation, MapPin, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Organ {
    id: number;
    organ_type: string;
    blood_type: string;
    hospital_name: string;
    hospital_city: string;
    viability_remaining: number;
    viability_percentage: number;
    status: string;
}

interface OrganTransplantTrackerProps {
    organs: Organ[];
    loading?: boolean;
}

const OrganCard = ({ organ }: { organ: Organ }) => {
    const navigate = useNavigate();

    const getViabilityColor = (percentage: number) => {
        if (percentage < 25) return 'text-red-500 bg-red-500/10 border-red-500/30';
        if (percentage < 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
        return 'text-green-500 bg-green-500/10 border-green-500/30';
    };

    const colorClass = getViabilityColor(organ.viability_percentage);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white capitalize">{organ.organ_type}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-mono">{organ.blood_type}</span>
                            <span>• Donor ID: #{organ.id}</span>
                        </div>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold border ${colorClass}`}>
                    {organ.viability_remaining}h remaining
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                    <span>Viability</span>
                    <span>{organ.viability_percentage}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${organ.viability_percentage < 25 ? 'bg-red-500' :
                                organ.viability_percentage < 50 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${organ.viability_percentage}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-400">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span>{organ.hospital_name}, {organ.hospital_city}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                    onClick={() => navigate(`/organs/${organ.id}/matches`)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10"
                >
                    Find Match
                </button>
                <button
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Navigation className="w-4 h-4" /> Track
                </button>
            </div>
        </div>
    );
};

const OrganTransplantTracker = ({ organs, loading }: OrganTransplantTrackerProps) => {
    if (loading) return <div>Loading tracker...</div>;

    if (organs.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Active Organ Logistics</h2>
                        <p className="text-sm text-zinc-400">Live viability tracking & transport</p>
                    </div>
                </div>
                <button className="text-sm text-blue-400 hover:text-blue-300">View All Logistics</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {organs.map((organ) => (
                    <OrganCard key={organ.id} organ={organ} />
                ))}

                {/* Add New Button */}
                <button className="border border-zinc-800 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all group min-h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Log New Organ</span>
                </button>
            </div>
        </div>
    );
};

export default OrganTransplantTracker;
