import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    getMyDonorProfile,
    updateDonor,
    getRequests,
    getMyDonationHistory,
    fulfillRequest
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { ProfileEditor, RequestCard } from '../components/DashboardComponents';
import { EmergencyMapView, MissionControlHeader } from '../components/EmergencyMapView';
import { QuickDonateButton } from '../components/QuickDonateButton';
import { VoiceAlertSystem } from '../components/VoiceAlertSystem';
import { Heart, Users, Droplet, Trophy, Award, Star, Clock, Calendar, Shield } from 'lucide-react';
import './DonorDashboard.css';

function DonorDashboard() {
    const { showToast } = useToast();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState('mission');
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

        socket.on('crisis-mode', (data) => {
            if (data.active) {
                showToast(`🚨 MASS CASUALTY ALERT from ${data.hospital_name}! Check your Emergency Map.`, 'error');
            }
        });

        return () => {
            socket.off('new-request');
            socket.off('crisis-mode');
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
            setProfile(prev => ({ ...prev, available: newStatus }));

            await updateDonor(profile.id, { available: newStatus });
            showToast(`You are now ${newStatus ? 'READY FOR MISSION' : 'Off Duty'}`, 'success');
        } catch (error) {
            setProfile(prev => ({ ...prev, available: !newStatus })); // Revert
            showToast('Failed to update availability', 'error');
        }
    };

    const handleFulfillRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to commit to donating for this request?')) return;

        try {
            await fulfillRequest(requestId);
            showToast('Thank you! The hospital has been notified. You are a hero! 🦸', 'success');
            // Refresh data
            fetchDashboardData();
        } catch (error) {
            showToast('Failed to fulfill request: ' + error.message, 'error');
        }
    };

    const handleRespondToEmergency = (request) => {
        setActiveTab('requests');
        // Scroll to the specific request or highlight it
        showToast(`Viewing request #${request.id} - ${request.blood_type}`, 'info');
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

    // Calculate stats for Mission Control
    const stats = {
        totalDonations: history.length,
        nearbyEmergencies: requests.length,
        criticalCount: requests.filter(r => r.urgency === 'critical').length
    };

    return (
        <div className="donor-dashboard first-responder-theme">
            <div className="container section">
                {/* Mission Control Header */}
                <MissionControlHeader
                    profile={profile}
                    available={!!profile.available}
                    onToggle={handleToggleAvailability}
                    stats={stats}
                    loading={actionLoading}
                />

                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'mission' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mission')}
                    >
                        🎯 Mission Control
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                        onClick={() => setActiveTab('map')}
                    >
                        🗺️ Emergency Map
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        📋 Requests ({requests.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        🏆 History ({history.length})
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'mission' && (
                        <div className="animate-fade-in">
                            {/* Quick Actions */}
                            <div className="quick-actions glass-card">
                                <h3>Quick Actions</h3>
                                <div className="action-grid">
                                    <button
                                        className="action-btn"
                                        onClick={() => setActiveTab('map')}
                                    >
                                        <span className="action-icon">🗺️</span>
                                        <span className="action-label">View Map</span>
                                    </button>
                                    <button
                                        className="action-btn critical"
                                        onClick={() => setActiveTab('requests')}
                                        disabled={requests.length === 0}
                                    >
                                        <span className="action-icon">🚨</span>
                                        <span className="action-label">
                                            {stats.criticalCount > 0
                                                ? `${stats.criticalCount} Critical!`
                                                : 'No Alerts'}
                                        </span>
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => setActiveTab('history')}
                                    >
                                        <span className="action-icon">🏆</span>
                                        <span className="action-label">{history.length} Saves</span>
                                    </button>
                                </div>
                            </div>

                            {/* Impact Stats Section */}
                            <div className="impact-stats-section">
                                <h3>Your Impact</h3>
                                <div className="impact-stats-grid">
                                    <motion.div
                                        className="impact-stat-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="impact-icon hearts">
                                            <Heart size={24} fill="currentColor" />
                                        </div>
                                        <div className="impact-value">{history.length * 3}</div>
                                        <div className="impact-label">Lives Touched</div>
                                    </motion.div>
                                    <motion.div
                                        className="impact-stat-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="impact-icon donations">
                                            <Droplet size={24} />
                                        </div>
                                        <div className="impact-value">{history.length}</div>
                                        <div className="impact-label">Total Donations</div>
                                    </motion.div>
                                    <motion.div
                                        className="impact-stat-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="impact-icon streak">
                                            <Trophy size={24} />
                                        </div>
                                        <div className="impact-value">{Math.min(history.length, 5)}</div>
                                        <div className="impact-label">Donation Streak</div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Achievement Badges */}
                            <div className="achievements-section">
                                <h3>Achievements</h3>
                                <div className="achievements-grid">
                                    <motion.div
                                        className={`achievement-badge ${history.length >= 1 ? 'earned' : 'locked'}`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="badge-icon">
                                            <Award size={28} />
                                        </div>
                                        <span className="badge-name">First Donation</span>
                                        <span className="badge-desc">Complete your first donation</span>
                                    </motion.div>
                                    <motion.div
                                        className={`achievement-badge ${history.length >= 5 ? 'earned' : 'locked'}`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="badge-icon">
                                            <Star size={28} />
                                        </div>
                                        <span className="badge-name">Rising Hero</span>
                                        <span className="badge-desc">Donate 5 times</span>
                                    </motion.div>
                                    <motion.div
                                        className={`achievement-badge ${history.length >= 10 ? 'earned' : 'locked'}`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="badge-icon">
                                            <Shield size={28} />
                                        </div>
                                        <span className="badge-name">Life Guardian</span>
                                        <span className="badge-desc">Donate 10 times</span>
                                    </motion.div>
                                    <motion.div
                                        className={`achievement-badge ${profile?.available ? 'earned' : 'locked'}`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="badge-icon">
                                            <Clock size={28} />
                                        </div>
                                        <span className="badge-name">Always Ready</span>
                                        <span className="badge-desc">Stay available for emergencies</span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Recent Emergencies Preview */}
                            {requests.length > 0 && (
                                <div className="recent-emergencies">
                                    <h3>⚡ Active Emergencies</h3>
                                    <div className="emergency-preview">
                                        {requests.slice(0, 3).map(req => (
                                            <RequestCard
                                                key={req.id}
                                                request={req}
                                                onFulfill={handleFulfillRequest}
                                            />
                                        ))}
                                    </div>
                                    {requests.length > 3 && (
                                        <button
                                            className="btn btn-outline mt-4"
                                            onClick={() => setActiveTab('requests')}
                                        >
                                            View All {requests.length} Requests
                                        </button>
                                    )}
                                </div>
                            )}

                            {requests.length === 0 && (
                                <div className="all-clear glass-card">
                                    <span className="all-clear-icon">✅</span>
                                    <h3>All Clear!</h3>
                                    <p>No emergencies in your area. Thank you for being ready to help!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="animate-fade-in">
                            <EmergencyMapView
                                requests={requests}
                                donorCity={profile.city}
                                onRespond={handleRespondToEmergency}
                            />
                        </div>
                    )}

                    {activeTab === 'requests' && (
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
                            <h3 className="mb-4 text-xl font-bold">🏆 Your Donation History</h3>
                            {history.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <p>You haven't made any donations yet. Your first one will be special! 🩸</p>
                                </div>
                            ) : (
                                <div className="requests-list">
                                    {history.map(req => (
                                        <div key={req.id} className="glass-card request-card completed">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="badge badge-fulfilled">✓ Completed</span>
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(req.fulfilled_at || req.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4>Donated to {req.patient_name || 'Patient'}</h4>
                                                <p className="text-sm text-gray-400">Hospital: {req.hospital_name}</p>
                                            </div>
                                            <div className="donation-badge">
                                                <span className="blood-type">{req.blood_type}</span>
                                                <span className="units">{req.units} unit{req.units > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Command Center Components */}
            {
                profile && (
                    <>
                        <QuickDonateButton
                            userBloodType={profile.blood_type}
                            userName={profile.name}
                            onDonate={async (data) => {
                                // Find matching request or create general availability
                                showToast(`Mission accepted! ETA: ${data.eta}`, 'success');
                                // In a real app, this would match to a specific request ID
                            }}
                        />
                        <VoiceAlertSystem />
                    </>
                )
            }
        </div >
    );
}

export default DonorDashboard;
