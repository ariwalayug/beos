import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getRequests, createRequest, fulfillRequest, cancelRequest, getHospitals } from '../services/api';
import { useRealTimeRequests } from '../hooks/useSocket';
import RequestCard from '../components/RequestCard';
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
        blood_type: '',
        units: 1,
        urgency: 'normal',
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
                blood_type: '',
                units: 1,
                urgency: 'normal',
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
        <div className="emergency-page masterpiece">
            {/* Background Effects */}
            <div className="page-background">
                <div className="gradient-orb orb-critical"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="container section">
                <header className="page-header animate-slide-up">
                    <div className="header-badge critical-badge">
                        <span className="pulse-dot critical"></span>
                        <span>Live Emergency Feed</span>
                    </div>
                    <h1 className="page-title">
                        Critical
                        <span className="text-gradient-critical"> Requests</span>
                    </h1>
                    <p className="page-subtitle">
                        Every second counts. Respond to urgent blood requests in real-time.
                    </p>
                    <button className="btn btn-hero-primary glow-effect animate-pop-in delay-1" onClick={() => setShowForm(true)}>
                        <span className="btn-icon">🚨</span>
                        Broadcast Emergency
                    </button>
                </header>

                {/* Filter Tabs */}
                <div className="filter-bar glass-card animate-slide-up delay-1">
                    {['pending', 'fulfilled', 'cancelled', 'all'].map(tab => (
                        <button
                            key={tab}
                            className={`filter-btn ${filter === tab ? 'active' : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'pending' && <span className="count-badge">{requests.filter(r => r.status === 'pending').length}</span>}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="requests-container animate-fade-in delay-2">
                    {loading ? (
                        <div className="loading-grid">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="skeleton-card request-skeleton"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="error-state glass-card">
                            <h3>Connection Error</h3>
                            <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="empty-state glass-card">
                            <span className="empty-icon">✅</span>
                            <h3>All Clear</h3>
                            <p>No {filter} emergency requests at the moment.</p>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {filteredRequests.map((request, index) => (
                                <div
                                    key={request.id}
                                    className="request-wrapper"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <RequestCard
                                        request={request}
                                        onFulfill={handleFulfill}
                                        onCancel={handleCancel}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="modal-overlay animate-fade-in" onClick={() => setShowForm(false)}>
                    <div className="modal-card glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-icon">🚨</div>
                            <h2>Broadcast Emergency</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="emergency-form">
                            <div className="form-group floating-label">
                                <label className="field-label">Urgency Level</label>
                                <div className="urgency-selector">
                                    {['normal', 'urgent', 'critical'].map(level => (
                                        <label key={level} className={`urgency-option ${formData.urgency === level ? 'selected' : ''} ${level}`}>
                                            <input
                                                type="radio"
                                                name="urgency"
                                                value={level}
                                                checked={formData.urgency === level}
                                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                            />
                                            <span className="urgency-icon">
                                                {level === 'critical' ? '⚡' : level === 'urgent' ? '🔥' : '⚠️'}
                                            </span>
                                            <span className="urgency-text">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="field-label">Blood Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.blood_type}
                                        onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {bloodTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Units</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="1" max="20"
                                        value={formData.units}
                                        onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="field-label">Hospital (Optional)</label>
                                <select
                                    className="form-select"
                                    value={formData.hospital_id}
                                    onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                                >
                                    <option value="">Select hospital...</option>
                                    {hospitals.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-text" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn-broadcast" disabled={submitting}>
                                    {submitting ? 'Broadcasting...' : '🔴 Broadcast Alert'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Emergency;
