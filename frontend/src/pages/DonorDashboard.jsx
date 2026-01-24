import { useState, useEffect } from 'react';
import {
    getMyDonorProfile,
    updateDonor,
    getRequests,
    getMyDonationHistory,
    fulfillRequest
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { ProfileEditor, AvailabilityToggle, RequestCard } from '../components/DashboardComponents';
import './DonorDashboard.css';

function DonorDashboard() {
    const { showToast } = useToast();
    const socket = useSocket();
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('new-request', (newRequest) => {
            if (newRequest.urgency === 'critical') {
                showToast(`🚨 CRITICAL: ${newRequest.blood_type} needed in ${newRequest.hospital_city || 'your area'}!`, 'error');
            } else {
                showToast(`New Request: ${newRequest.blood_type} needed.`, 'info');
            }
            // Optimistically add request
            setRequests(prev => [newRequest, ...prev]);
        });

        return () => {
            socket.off('new-request');
        };
    }, [socket, showToast]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const profileRes = await getMyDonorProfile();
            setProfile(profileRes.data);

            // Fetch requests and filter by donor's city matching hospital city
            const requestsRes = await getRequests({ status: 'pending' });
            // Client-side filtering for "Nearby" (same city)
            const nearby = requestsRes.data.filter(r =>
                r.hospital_city?.toLowerCase() === profileRes.data.city?.toLowerCase()
            );
            setRequests(nearby);

            const historyRes = await getMyDonationHistory();
            setHistory(historyRes.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load dashboard data. ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (data) => {
        try {
            setActionLoading(true);
            const res = await updateDonor(profile.id, data);
            setProfile(res.data);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update profile: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleAvailability = async (newStatus) => {
        try {
            // Optimistic update
            const oldStatus = profile.available;
            setProfile(prev => ({ ...prev, available: newStatus }));

            await updateDonor(profile.id, { available: newStatus });
            showToast(`You are now ${newStatus ? 'Available' : 'Unavailable'}`, 'success');
        } catch (error) {
            setProfile(prev => ({ ...prev, available: !newStatus })); // Revert
            showToast('Failed to update availability', 'error');
        }
    };

    const handleFulfillRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to commit to donating for this request?')) return;

        try {
            await fulfillRequest(requestId);
            showToast('Thank you! The hospital has been notified.', 'success');
            // Refresh data
            fetchDashboardData();
        } catch (error) {
            showToast('Failed to fulfill request: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container section text-center">
                <h2>Profile Not Found</h2>
                <p>Please contact support or try logging in again.</p>
            </div>
        );
    }

    return (
        <div className="donor-dashboard">
            <div className="container section">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Welcome back, {profile.name.split(' ')[0]}! 👋</h1>
                        <p>Thank you for being a life saver.</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card glass-card">
                            <span className="stat-label">Blood Type</span>
                            <span className="stat-value text-gradient">{profile.blood_type}</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-label">Total Donations</span>
                            <span className="stat-value">{history.length}</span>
                        </div>
                        <div className="stat-card glass-card">
                            <span className="stat-label">Nearby Emergencies</span>
                            <span className={`stat-value ${requests.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {requests.length}
                            </span>
                        </div>
                    </div>

                    <AvailabilityToggle
                        available={!!profile.available}
                        onToggle={handleToggleAvailability}
                        loading={actionLoading}
                    />
                </header>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview & Requests
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        My Profile
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Donation History
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <h3 className="mb-4 text-xl font-bold">Nearby Emergency Requests ({requests.length})</h3>
                            {requests.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <p>No emergency requests in your city currently. Great news! 🎉</p>
                                </div>
                            ) : (
                                <div className="requests-list">
                                    {requests.map(req => (
                                        <RequestCard
                                            key={req.id}
                                            request={req}
                                            onFulfill={handleFulfillRequest}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <div className="glass-card profile-card">
                                <ProfileEditor
                                    profile={profile}
                                    onSave={handleUpdateProfile}
                                    loading={actionLoading}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="animate-fade-in">
                            <h3 className="mb-4 text-xl font-bold">Your Donation History</h3>
                            {history.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <p>You haven't made any donations yet. Your first one will be special! 🩸</p>
                                </div>
                            ) : (
                                <div className="requests-list">
                                    {history.map(req => (
                                        <div key={req.id} className="glass-card request-card">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="badge badge-fulfilled">Completed</span>
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(req.fulfilled_at || req.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4>Donated to {req.patient_name || 'Patient'}</h4>
                                                <p className="text-sm text-gray-400">Hospital: {req.hospital_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DonorDashboard;
