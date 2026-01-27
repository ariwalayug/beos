import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getRequests, createRequest, fulfillRequest, cancelRequest, getHospitals } from '../services/api';
import { useRealTimeRequests } from '../hooks/useSocket';
import RequestCard from '../components/RequestCard';
import EmergencyRequestWizard from '../components/EmergencyRequestWizard';
import MapBackground from '../components/MapBackground';
import { AlertCircle, AlertTriangle, Activity, X, Plus, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import './Emergency.css';

function Emergency() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('pending');

    const toast = useToast();
    const { requests, setRequests } = useRealTimeRequests([]);

    const [formData, setFormData] = useState({
        hospital_id: '',
        patient_name: '',
        age: '',
        hemoglobin: '',
        platelets: '',
        blood_type: '',
        units: 1,
        urgency: 'normal',
        past_reaction: '',
        contact_phone: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []); // Only fetch on mount - filtering is done client-side

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsRes, hospitalsRes] = await Promise.all([
                getRequests(), // Always fetch ALL requests
                getHospitals()
            ]);
            setRequests(requestsRes.data);
            setHospitals(hospitalsRes.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const response = await createRequest(formData);
            setRequests(prev => [response.data, ...prev]);
            setShowForm(false);
            setFormData({
                hospital_id: '',
                patient_name: '',
                age: '',
                hemoglobin: '',
                platelets: '',
                blood_type: '',
                units: 1,
                urgency: 'normal',
                past_reaction: '',
                contact_phone: '',
                notes: ''
            });
            toast.success('Emergency request broadcasted successfully');
        } catch (err) {
            toast.error('Error creating request: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ... handlers same as before ...
    const handleFulfill = async (id) => {
        try {
            const response = await fulfillRequest(id);
            setRequests(prev => prev.map(r => r.id === id ? response.data : r));
            toast.success('Request marked as fulfilled');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCancel = async (id) => {
        try {
            const response = await cancelRequest(id);
            setRequests(prev => prev.map(r => r.id === id ? response.data : r));
            toast.success('Request cancelled');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const filteredRequests = requests.filter(r => filter === 'all' ? true : r.status === filter);

    return (
        <PageTransition className="emergency-page professional">
            <MapBackground />
            <div className="container section">
                <FadeIn className="page-header-pro">
                    <div className="header-badge critical">
                        <AlertCircle size={16} />
                        <span>Live Response Feed</span>
                    </div>
                    <h1>Critical Requests</h1>
                    <p>Urgent blood requirements requiring immediate attention.</p>
                </FadeIn>

                <div className="emergency-controls">
                    <div className="filter-tabs-pro">
                        {['pending', 'fulfilled', 'cancelled', 'all'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${filter === tab ? 'active' : ''}`}
                                onClick={() => setFilter(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'pending' && <span className="tab-badge">{requests.filter(r => r.status === 'pending').length}</span>}
                            </button>
                        ))}
                    </div>

                    <button className="btn btn-danger" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> New Request
                    </button>
                </div>

                <div className="results-container">
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-card-pro h-48"></div>)}
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="empty-state-pro">
                            <Activity size={48} className="text-muted" />
                            <h3>No {filter !== 'all' ? filter : ''} requests</h3>
                            <p>All clear at the moment.</p>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="requests-grid-pro"
                        >
                            <AnimatePresence>
                                {filteredRequests.map(request => (
                                    <motion.div
                                        key={request.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <RequestCard
                                            request={request}
                                            onFulfill={handleFulfill}
                                            onCancel={handleCancel}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Emergency Request Wizard */}
            <AnimatePresence>
                {showForm && (
                    <EmergencyRequestWizard
                        onClose={() => setShowForm(false)}
                        onSubmit={async (data) => {
                            try {
                                const response = await createRequest({
                                    ...data,
                                    hospital_id: data.hospital_id || undefined
                                });
                                setRequests(prev => [response.data, ...prev]);
                                toast.success('Emergency request broadcasted successfully');
                                return response;
                            } catch (err) {
                                toast.error('Error creating request: ' + err.message);
                                throw err;
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </PageTransition>
    );
}

export default Emergency;
