import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getRequests, createRequest, fulfillRequest, cancelRequest, getHospitals } from '../services/api';
import { useRealTimeRequests } from '../hooks/useSocket';
import RequestCard from '../components/RequestCard';
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
    }, [filter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsRes, hospitalsRes] = await Promise.all([
                getRequests(filter !== 'all' ? { status: filter } : {}),
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

            {/* Modal Form with AnimatePresence */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="modal-overlay-pro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-card-pro"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h2>Broadcast Emergency</h2>
                                <button className="close-btn" onClick={() => setShowForm(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-section">
                                    <label className="label-heading">Urgency Level</label>
                                    <div className="urgency-grid">
                                        <label className={`urgency-card normal ${formData.urgency === 'normal' ? 'selected' : ''}`}>
                                            <input type="radio" name="urgency" value="normal" checked={formData.urgency === 'normal'} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} />
                                            <Info size={24} />
                                            <span>Normal</span>
                                        </label>
                                        <label className={`urgency-card urgent ${formData.urgency === 'urgent' ? 'selected' : ''}`}>
                                            <input type="radio" name="urgency" value="urgent" checked={formData.urgency === 'urgent'} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} />
                                            <AlertTriangle size={24} />
                                            <span>Urgent</span>
                                        </label>
                                        <label className={`urgency-card critical ${formData.urgency === 'critical' ? 'selected' : ''}`}>
                                            <input type="radio" name="urgency" value="critical" checked={formData.urgency === 'critical'} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} />
                                            <Zap size={24} />
                                            <span>Critical</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group-pro">
                                    <label>Patient Name</label>
                                    <input type="text" value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} required />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group-pro">
                                        <label>Age</label>
                                        <input type="number" min="1" max="120" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required placeholder="Yrs" />
                                    </div>
                                    <div className="form-group-pro">
                                        <label>Hb Level</label>
                                        <input type="number" step="0.1" value={formData.hemoglobin} onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })} required placeholder="g/dL" />
                                    </div>
                                    <div className="form-group-pro">
                                        <label>Platelets</label>
                                        <input type="number" value={formData.platelets} onChange={(e) => setFormData({ ...formData, platelets: e.target.value })} required placeholder="Count" />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group-pro">
                                        <label>Blood Type</label>
                                        <select value={formData.blood_type} onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })} required >
                                            <option value="">Select...</option>
                                            {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group-pro">
                                        <label>Units</label>
                                        <input type="number" min="1" max="20" value={formData.units} onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })} required />
                                    </div>
                                </div>

                                <div className="form-group-pro">
                                    <label>Past Blood Reaction (Optional)</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Details of any previous adverse reactions..."
                                        value={formData.past_reaction}
                                        onChange={(e) => setFormData({ ...formData, past_reaction: e.target.value })}
                                    />
                                </div>

                                <div className="form-group-pro">
                                    <label>Hospital (Optional)</label>
                                    <select value={formData.hospital_id} onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })} >
                                        <option value="">Select hospital...</option>
                                        {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger" disabled={submitting}>
                                        {submitting ? 'Broadcasting...' : 'Broadcast Alert'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
}

export default Emergency;
