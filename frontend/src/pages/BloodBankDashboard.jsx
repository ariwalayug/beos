import { useState, useEffect } from 'react';
import {
    getMyBloodBankProfile,
    getBatches,
    addBatch,
    deleteBatch
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { InventoryTable, AddBatchForm, LowStockAlerts } from '../components/BloodBankComponents';
import './BloodBankDashboard.css';

function BloodBankDashboard() {
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const profileRes = await getMyBloodBankProfile();
            setProfile(profileRes.data);

            const batchesRes = await getBatches();
            setBatches(batchesRes.data);

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
            await fetchDashboardData(); // Refresh list
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
                <header className="dashboard-header flex justify-between items-end">
                    <div className="dashboard-welcome">
                        <h1>{profile.name} Inventory</h1>
                        <p className="text-gray-400">{profile.city} • Blood Bank Panel</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-accent">
                            {batches.reduce((sum, b) => sum + (new Date(b.expiry_date) > new Date() ? b.units : 0), 0)}
                        </p>
                        <p className="text-sm text-gray-400">Total Valid Units</p>
                    </div>
                </header>

                <div className="dashboard-content animate-fade-in">
                    <LowStockAlerts batches={batches} />

                    <div className="add-batch-card">
                        <AddBatchForm onSubmit={handleAddBatch} loading={actionLoading} />
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-xl mb-4">Current Inventory Batches</h3>
                        <InventoryTable batches={batches} onDelete={handleDeleteBatch} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BloodBankDashboard;
