import { useState, useEffect } from 'react';
import {
    getMyHospitalProfile,
    createRequest,
    getRequests,
    cancelRequest,
    getDonors
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { RequestForm, ActiveRequestsList, MatchedDonors, BloodInventoryGrid } from '../components/HospitalComponents';
import { LiveRequestTracker, MassCasualtyTrigger, HospitalStatsGrid } from '../components/LiveRequestTracker';
import './HospitalDashboard.css';

function HospitalDashboard() {
    const { showToast } = useToast();
    const socket = useSocket();
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('command');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [crisisMode, setCrisisMode] = useState(false);

    // Matched Donors State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [matchedDonors, setMatchedDonors] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Real-time updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        socket.on('request-update', (updatedRequest) => {
            setRequests(prev => prev.map(r =>
                r.id === updatedRequest.id ? { ...r, ...updatedRequest } : r
            ));
        });

        socket.on('request-fulfilled', (data) => {
            showToast(`🎉 Request #${data.request_id} has been fulfilled!`, 'success');
            fetchDashboardData();
        });

        return () => {
            socket.off('request-update');
            socket.off('request-fulfilled');
        };
    }, [socket, showToast]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const profileRes = await getMyHospitalProfile();
            setProfile(profileRes.data);

            const requestsRes = await getRequests({
                hospital_id: profileRes.data.id,
                status: 'pending'
            });
            setRequests(requestsRes.data);

        } catch (error) {
            console.error(error);
            showToast('Failed to load dashboard data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (formData) => {
        try {
            setActionLoading(true);
            const data = {
                ...formData,
                hospital_id: profile.id,
                status: 'pending',
                // If crisis mode is active, auto-set to critical
                urgency: crisisMode ? 'critical' : formData.urgency
            };

            await createRequest(data);
            showToast('Emergency request broadcasted successfully!', 'success');

            // Refresh requests and switch to tracker view
            await fetchDashboardData();
            setActiveTab('command');
        } catch (error) {
            showToast('Failed to create request: ' + error.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelRequest = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) return;

        try {
            await cancelRequest(id);
            showToast('Request cancelled.', 'info');
            fetchDashboardData();
        } catch (error) {
            showToast('Failed to cancel request.', 'error');
        }
    };

    const handleFindDonors = async (request) => {
        try {
            setSelectedRequest(request);
            setActiveTab('donors');
            setLoading(true);

            // Find donors with same blood type and city
            const res = await getDonors({
                blood_type: request.blood_type,
                city: profile.city,
                available: true
            });
            setMatchedDonors(res.data);

        } catch (error) {
            showToast('Failed to find donors.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCrisisToggle = async (activate) => {
        try {
            setActionLoading(true);
            setCrisisMode(activate);

            if (activate) {
                showToast('🚨 CRISIS MODE ACTIVATED - All resources notified!', 'error');
                // Emit crisis event via WebSocket
                if (socket) {
                    socket.emit('crisis-mode', {
                        hospital_id: profile.id,
                        hospital_name: profile.name,
                        city: profile.city,
                        active: true
                    });
                }
            } else {
                showToast('Crisis mode deactivated', 'info');
                if (socket) {
                    socket.emit('crisis-mode', {
                        hospital_id: profile.id,
                        active: false
                    });
                }
            }
        } catch (error) {
            showToast('Failed to toggle crisis mode', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) return <div>Access Denied. Not a hospital account.</div>;

    return (
        <div className={`hospital-dashboard ${crisisMode ? 'crisis-active' : ''}`}>
            <div className="container section">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>🏥 {profile.name}</h1>
                        <p className="text-gray-400">{profile.city} • Emergency Command Center</p>
                    </div>
                </header>

                {/* Crisis Trigger - Always Visible */}
                <MassCasualtyTrigger
                    onTrigger={handleCrisisToggle}
                    isActive={crisisMode}
                    loading={actionLoading}
                />

                {/* Stats Grid */}
                <HospitalStatsGrid requests={requests} profile={profile} />

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'command' ? 'active' : ''}`}
                        onClick={() => setActiveTab('command')}
                    >
                        🎯 Command Center
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        ➕ New Request
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        📋 Active ({requests.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('donors')}
                    >
                        👥 Match Donors
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        📦 Inventory
                    </button>
                </div>

                <div className="dashboard-content animate-fade-in">
                    {activeTab === 'command' && (
                        <LiveRequestTracker
                            requests={requests}
                            onRequestClick={handleFindDonors}
                        />
                    )}

                    {activeTab === 'create' && (
                        <div className="glass-card request-form-card">
                            <RequestForm onSubmit={handleCreateRequest} loading={actionLoading} />
                            {crisisMode && (
                                <div className="crisis-notice">
                                    ⚠️ Crisis Mode Active - All requests will be marked as CRITICAL
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <ActiveRequestsList
                            requests={requests}
                            onCancel={handleCancelRequest}
                            onMatch={handleFindDonors}
                        />
                    )}

                    {activeTab === 'donors' && (
                        <div>
                            {selectedRequest ? (
                                <div>
                                    <div className="mb-4">
                                        <h3>Matching Donors for Request #{selectedRequest.id}</h3>
                                        <p className="text-gray-400">
                                            Looking for <strong>{selectedRequest.blood_type}</strong> donors in <strong>{profile.city}</strong>
                                        </p>
                                    </div>
                                    <MatchedDonors donors={matchedDonors} />
                                </div>
                            ) : (
                                <div className="empty-state glass-card">
                                    <p>Select a request from "Active Requests" to find compatible donors.</p>
                                    <button className="btn btn-secondary mt-4" onClick={() => setActiveTab('active')}>
                                        Go to Active Requests
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="glass-card p-6">
                            <BloodInventoryGrid />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HospitalDashboard;
