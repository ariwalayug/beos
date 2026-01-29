import { useState, useEffect } from 'react';
import {
    getMyBloodBankProfile,
    getBatches,
    addBatch,
    deleteBatch,
    getDonors
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { InventoryTable, AddBatchForm, LowStockAlerts } from '../components/BloodBankComponents';
import { InventoryHeatmap, ExpiryAlertsList, DonorRadar } from '../components/InventoryHeatmap';
import './BloodBankDashboard.css';

function BloodBankDashboard() {
    const { showToast } = useToast();
    const socket = useSocket();
    const [profile, setProfile] = useState(null);
    const [batches, setBatches] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedBloodType, setSelectedBloodType] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Real-time updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        socket.on('crisis-mode', (data) => {
            if (data.active) {
                showToast(`🚨 CRISIS ALERT from ${data.hospital_name}: Mass casualty protocol activated!`, 'error');
            }
        });

        socket.on('inventory-update', () => {
            fetchDashboardData();
        });

        return () => {
            socket.off('crisis-mode');
            socket.off('inventory-update');
        };
    }, [socket, showToast]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const profileRes = await getMyBloodBankProfile();
            setProfile(profileRes.data);

            const batchesRes = await getBatches();
            setBatches(batchesRes.data);

            // Fetch donors for the radar
            const donorsRes = await getDonors({ city: profileRes.data.city });
            setDonors(donorsRes.data);

        } catch (error) {
            console.error(error);
            showToast('Failed to load dashboard data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBatch = async (formData) => {
        try {
            setActionLoading(true);
            await addBatch(formData);
            showToast('Stock updated successfully!', 'success');
            await fetchDashboardData();
        } catch (error) {
            showToast('Failed to update stock: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm('Are you sure you want to remove this batch from inventory?')) return;

        try {
            await deleteBatch(id);
            showToast('Batch removed.', 'info');
            setBatches(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            showToast('Failed to delete batch.', 'error');
        }
    };

    const handleSelectDonor = (donor) => {
        showToast(`Selected ${donor.name} (${donor.blood_type})`, 'info');
    };

    // Calculate summary stats
    const getStats = () => {
        const validBatches = batches.filter(b => new Date(b.expiry_date) > new Date());
        const totalUnits = validBatches.reduce((sum, b) => sum + b.units, 0);
        const expiringSoon = validBatches.filter(b => {
            const days = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            return days <= 7;
        }).length;
        const availableDonors = donors.filter(d => d.available).length;

        return { totalUnits, expiringSoon, availableDonors, batchCount: validBatches.length };
    };

    const stats = getStats();

    if (loading && !profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) return <div>Access Denied. Not a blood bank account.</div>;

    return (
        <div className="bb-dashboard">
            <div className="container section">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>🏦 {profile.name}</h1>
                        <p className="text-gray-400">{profile.city} • Logistics & Supply Hub</p>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className="bb-stats-grid">
                    <div className="bb-stat glass-card">
                        <span className="stat-icon">📦</span>
                        <div className="stat-content">
                            <span className="stat-value text-gradient">{stats.totalUnits}</span>
                            <span className="stat-label">Total Valid Units</span>
                        </div>
                    </div>
                    <div className="bb-stat glass-card">
                        <span className="stat-icon">📋</span>
                        <div className="stat-content">
                            <span className="stat-value">{stats.batchCount}</span>
                            <span className="stat-label">Active Batches</span>
                        </div>
                    </div>
                    <div className={`bb-stat glass-card ${stats.expiringSoon > 0 ? 'warning' : ''}`}>
                        <span className="stat-icon">⏰</span>
                        <div className="stat-content">
                            <span className={`stat-value ${stats.expiringSoon > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {stats.expiringSoon}
                            </span>
                            <span className="stat-label">Expiring Soon</span>
                        </div>
                    </div>
                    <div className="bb-stat glass-card">
                        <span className="stat-icon">👥</span>
                        <div className="stat-content">
                            <span className="stat-value text-green-500">{stats.availableDonors}</span>
                            <span className="stat-label">Available Donors</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        📦 Inventory
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('donors')}
                    >
                        📡 Donor Radar
                    </button>
                </div>

                <div className="dashboard-content animate-fade-in">
                    {activeTab === 'overview' && (
                        <div>
                            {/* Inventory Heatmap */}
                            <InventoryHeatmap batches={batches} />

                            {/* Expiry Alerts */}
                            <ExpiryAlertsList batches={batches} />

                            {/* Low Stock Alerts (legacy) */}
                            <LowStockAlerts batches={batches} />
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div>
                            <div className="add-batch-card glass-card mb-6">
                                <AddBatchForm onSubmit={handleAddBatch} loading={actionLoading} />
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="text-xl mb-4">Current Inventory Batches</h3>
                                <InventoryTable batches={batches} onDelete={handleDeleteBatch} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'donors' && (
                        <div>
                            <div className="blood-type-filter mb-6">
                                <label className="form-label">Filter by Blood Type:</label>
                                <div className="blood-type-buttons">
                                    <button
                                        className={`blood-type-btn ${!selectedBloodType ? 'active' : ''}`}
                                        onClick={() => setSelectedBloodType(null)}
                                    >
                                        All
                                    </button>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                        <button
                                            key={type}
                                            className={`blood-type-btn ${selectedBloodType === type ? 'active' : ''}`}
                                            onClick={() => setSelectedBloodType(type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <DonorRadar
                                donors={donors}
                                selectedBloodType={selectedBloodType}
                                onSelectDonor={handleSelectDonor}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BloodBankDashboard;
