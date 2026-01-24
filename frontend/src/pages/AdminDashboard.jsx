import { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, deleteUser } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StatsCard, UserTable } from '../components/AdminComponents';
import './AdminDashboard.css';

function AdminDashboard() {
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [statsRes, usersRes] = await Promise.all([
                getAdminStats(),
                getAllUsers()
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
            setError(error.message);
            showToast('Failed to load admin data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Are you sure you want to delete user #${userId}? This action cannot be undone.`)) return;

        try {
            await deleteUser(userId);
            showToast('User deleted successfully', 'success');
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            showToast('Failed to delete user: ' + error.message, 'error');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="spinner"></div></div>;

    if (error) {
        return (
            <div className="container section">
                <div className="error-container glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Failed to Load</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container section">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">System overview and management</p>
                </header>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Users"
                            value={stats.users.total}
                            color="blue"
                            icon="👥"
                        />
                        <StatsCard
                            title="Critical Alerts"
                            value={stats.requests.critical}
                            color="red"
                            icon="🚨"
                        />
                        <StatsCard
                            title="Active Requests"
                            value={stats.requests.total}
                            color="orange"
                            icon="📋"
                        />
                        <StatsCard
                            title="Total Donations"
                            value={stats.donations}
                            color="green"
                            icon="🩸"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6 flex flex-col justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/donors'}>
                        <div>
                            <div className="text-red-500 text-3xl mb-4">🩸</div>
                            <h3 className="text-xl font-bold text-white mb-2">Manage Donors</h3>
                            <p className="text-gray-400">View detailed list of all registered donors, check availability and history.</p>
                        </div>
                        <div className="mt-4 text-red-400 flex items-center">
                            View Donors <span className="ml-2">→</span>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4">User Management ({users.length})</h3>
                <UserTable users={users} onDelete={handleDeleteUser} />
            </div>
        </div>
    );
}

export default AdminDashboard;
