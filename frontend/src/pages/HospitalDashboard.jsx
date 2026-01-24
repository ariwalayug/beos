import { useState, useEffect } from 'react';
import {
    getMyHospitalProfile,
    createRequest,
    getRequests,
    cancelRequest,
    getDonors
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { RequestForm, ActiveRequestsList, MatchedDonors } from '../components/HospitalComponents';
import './HospitalDashboard.css';

function HospitalDashboard() {
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('active');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Matched Donors State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [matchedDonors, setMatchedDonors] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

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
                status: 'pending'
            };

            await createRequest(data);
            showToast('Emergency request broadcasted successfully!', 'success');

            // Refresh requests and switch to list view
            await fetchDashboardData();
            setActiveTab('active');
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
            setLoading(true); // utilizing loading state for local section loading if desired, or assume fast

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

    if (loading && !profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) return <div>Access Denied. Not a hospital account.</div>;

    return (
        <div className="hospital-dashboard">
            <div className="container section">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>{profile.name} Dashboard</h1>
                        <p className="text-gray-400">{profile.city} • Emergency Portal</p>
                    </div>
                </header>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Request
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Requests ({requests.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('donors')}
                    >
                        Match Donors
                    </button>
                </div>

                <div className="dashboard-content animate-fade-in">
                    {activeTab === 'create' && (
                        <div className="glass-card request-form-card">
                            <RequestForm onSubmit={handleCreateRequest} loading={actionLoading} />
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
                </div>
            </div>
        </div>
    );
}

export default HospitalDashboard;
