import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, Map, Database, Activity } from 'lucide-react';
import '../styles/CommandCenter.css';

const NationalDashboard = () => {
    // Mock data for strategic reserves
    const reserves = [
        { type: 'O+', units: 2450, region: 'North', trend: 'stable' },
        { type: 'O-', units: 120, region: 'North', trend: 'critical' },
        { type: 'A+', units: 1800, region: 'West', trend: 'stable' },
        { type: 'B+', units: 3000, region: 'South', trend: 'surplus' },
    ];

    return (
        <div className="command-center-layout text-white min-h-screen bg-gray-900">
            <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">National Command Center</h1>
                        <p className="text-gray-400 text-sm">Strategic Blood Reserve Oversight</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-red-400 font-medium">3 Regions in Crisis</span>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-blue-400">08:42:15 UTC</div>
                    </div>
                </div>
            </header>

            <main className="p-6 grid grid-cols-12 gap-6">
                {/* Strategic Metric Cards */}
                <div className="col-span-12 grid grid-cols-4 gap-4">
                    <div className="glass-card p-4 rounded-xl border-l-4 border-blue-500">
                        <div className="text-gray-400 mb-1 flex items-center gap-2">
                            <Database className="w-4 h-4" /> Total National Reserve
                        </div>
                        <div className="text-3xl font-bold">12,450 <span className="text-sm text-gray-500 font-normal">units</span></div>
                    </div>
                    <div className="col-span-1 glass-card p-4 rounded-xl border-l-4 border-green-500">
                        <div className="text-gray-400 mb-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Fulfillment Rate
                        </div>
                        <div className="text-3xl font-bold text-green-400">94.2%</div>
                    </div>
                    <div className="col-span-1 glass-card p-4 rounded-xl border-l-4 border-amber-500">
                        <div className="text-gray-400 mb-1 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Active Emergencies
                        </div>
                        <div className="text-3xl font-bold text-amber-400">12</div>
                    </div>
                    <div className="col-span-1 glass-card p-4 rounded-xl border-l-4 border-purple-500">
                        <div className="text-gray-400 mb-1 flex items-center gap-2">
                            <Map className="w-4 h-4" /> Connected Hospitals
                        </div>
                        <div className="text-3xl font-bold text-purple-400">450</div>
                    </div>
                </div>

                {/* Main Map View Placeholder */}
                <div className="col-span-8 glass-card rounded-xl p-1 min-h-[500px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-800/50 flex items-center justify-center">
                        <div className="text-center">
                            <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl text-gray-400 font-medium">Geospatial Intelligence Layer</h3>
                            <p className="text-gray-500">Connecting to secure satellite feed...</p>
                        </div>
                    </div>
                    {/* Overlay Stats */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur p-4 rounded-lg border border-gray-700">
                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Regional Status</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-green-500"></span> North: Stable</div>
                            <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-amber-500"></span> West: Low Stock</div>
                            <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> East: CRITICAL</div>
                            <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-green-500"></span> South: Stable</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Strategic Alerts */}
                <div className="col-span-4 space-y-4">
                    <div className="glass-card p-4 rounded-xl">
                        <h3 className="font-bold border-b border-gray-700 pb-2 mb-4">⚠️ Strategic Shortage Alerts</h3>
                        <div className="space-y-3">
                            {reserves.map((item, i) => (
                                item.trend === 'critical' && (
                                    <div key={i} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-red-400">{item.type} Critical Low</div>
                                            <div className="text-xs text-gray-400">Region: {item.region} • Only {item.units} units left</div>
                                        </div>
                                        <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors">
                                            Mobilize
                                        </button>
                                    </div>
                                )
                            ))}
                            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-amber-400">B- Low Supply</div>
                                    <div className="text-xs text-gray-400">Region: West • 3 days coverage</div>
                                </div>
                                <button className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded transition-colors">
                                    Review
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl">
                        <h3 className="font-bold border-b border-gray-700 pb-2 mb-4">🤖 AI Recommendations</h3>
                        <div className="space-y-3 text-sm">
                            <div className="p-3 bg-blue-500/5 rounded border border-blue-500/10">
                                <p className="text-blue-300 mb-1">Logistics Optimization</p>
                                <p className="text-gray-400">Move 500 units of A+ from **South Hub** to **West Hub** to prevent projected shortfall in 48 hours.</p>
                            </div>
                            <div className="p-3 bg-blue-500/5 rounded border border-blue-500/10">
                                <p className="text-blue-300 mb-1">Donor Campaign</p>
                                <p className="text-gray-400">Activate "Urgent O-" push notifications for **Delhi NCR** region (Est. conversion: 150 units).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NationalDashboard;
