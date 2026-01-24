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

            toast.success('Emergency request created successfully');
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

            toast.success('Request fulfilled successfully');
        } catch (err) {
            toast.error('Error fulfilling request: ' + err.message);
        }
    };

    const handleCancel = async (id) => {
        try {
            const response = await cancelRequest(id);
            setRequests(prev => prev.map(r => r.id === id ? response.data : r));

            toast.success('Request cancelled');
        } catch (err) {
            toast.error('Error cancelling request: ' + err.message);
        }
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const filteredRequests = requests.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    return (
        <div className="emergency-page">
            <div className="container">
                <header className="page-header">
                    <div>
                        <h1>
                            <span className="pulse"></span>
                            Emergency Blood Requests
                        </h1>
                        <p>View and manage blood emergency requests in real-time</p>
                    </div>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setShowForm(true)}
                    >
                        + Create Request
                    </button>
                </header>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {['pending', 'fulfilled', 'cancelled', 'all'].map(tab => (
                        <button
                            key={tab}
                            className={`filter-tab ${filter === tab ? 'active' : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Request Form Modal */}
                {showForm && (
                    <div className="modal-overlay" onClick={() => setShowForm(false)}>
                        <div className="modal glass-card" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Create Blood Request</h2>
                                <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
                            </div>

                            <form onSubmit={handleSubmit} className="request-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Blood Type *</label>
                                        <select
                                            className="form-select"
                                            value={formData.blood_type}
                                            onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                            required
                                        >
                                            <option value="">Select blood type</option>
                                            {bloodTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Units Needed *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min="1"
                                            max="20"
                                            value={formData.units}

                                            onChange={(e) => setFormData({
                                                ...formData,
                                                units: e.target.value === '' ? '' : parseInt(e.target.value)
                                            })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Urgency Level *</label>
                                    <div className="urgency-options">
                                        {['normal', 'urgent', 'critical'].map(level => (
                                            <label key={level} className={`urgency-option ${formData.urgency === level ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="urgency"
                                                    value={level}
                                                    checked={formData.urgency === level}
                                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                                />
                                                <span className={`urgency-badge badge-${level}`}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Hospital</label>
                                    <select
                                        className="form-select"
                                        value={formData.hospital_id}
                                        onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                                    >
                                        <option value="">Select hospital (optional)</option>
                                        {hospitals.map(h => (
                                            <option key={h.id} value={h.id}>{h.name} - {h.city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Patient Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Optional"
                                            value={formData.patient_name}
                                            onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Contact Phone</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={formData.contact_phone}
                                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Additional details..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Requests List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading requests...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>Error: {error}</p>
                        <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="empty-state">
                        <h3>No {filter !== 'all' ? filter : ''} requests found</h3>
                        <p>Create a new blood request if needed</p>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {filteredRequests.map(request => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onFulfill={handleFulfill}
                                onCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Emergency;
