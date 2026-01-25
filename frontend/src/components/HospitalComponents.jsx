import { useState } from 'react';
import DonorCard from './DonorCard';

export function RequestForm({ onSubmit, loading }) {
    const [formData, setFormData] = useState({
        patient_name: '',
        blood_type: '',
        units: 1,
        urgency: 'normal',
        contact_phone: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <form onSubmit={handleSubmit} className="request-form">
            <h3>Create Emergency Request</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label">Patient Name (Optional)</label>
                    <input
                        type="text"
                        name="patient_name"
                        className="form-input"
                        value={formData.patient_name}
                        onChange={handleChange}
                        placeholder="Anonymous"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Blood Type *</label>
                    <select
                        name="blood_type"
                        className="form-select"
                        value={formData.blood_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Type</option>
                        {bloodTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Units Needed *</label>
                    <input
                        type="number"
                        name="units"
                        className="form-input"
                        min="1"
                        max="20"
                        value={formData.units}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Urgency Level *</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="urgency"
                                value="normal"
                                checked={formData.urgency === 'normal'}
                                onChange={handleChange}
                            />
                            <span>Normal</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="urgency"
                                value="urgent"
                                checked={formData.urgency === 'urgent'}
                                onChange={handleChange}
                            />
                            <span className="text-yellow-500">Urgent</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="urgency"
                                value="critical"
                                checked={formData.urgency === 'critical'}
                                onChange={handleChange}
                            />
                            <span className="text-red-500">Critical</span>
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Contact Phone (Optional)</label>
                    <input
                        type="tel"
                        name="contact_phone"
                        className="form-input"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder="Direct line for donor"
                    />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Notes</label>
                    <textarea
                        name="notes"
                        className="form-textarea"
                        rows="3"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Additional details covering location, specific requirements..."
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Creating Request...' : 'Broadcoast Request'}
                </button>
            </div>
        </form>
    );
}

export function ActiveRequestsList({ requests, onCancel, onMatch, onFulfill }) {
    if (requests.length === 0) {
        return (
            <div className="empty-state glass-card">
                <p>No active emergency requests. Standby for emergencies.</p>
            </div>
        );
    }

    return (
        <div className="requests-list">
            {requests.map(req => (
                <div key={req.id} className={`glass-card request-card ${req.urgency}`}>
                    <div className="request-info">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`badge badge-${req.urgency}`}>{req.urgency}</span>
                            <span className="text-sm text-gray-400">#{req.id}</span>
                            <span className="text-sm text-gray-400">• {new Date(req.created_at).toLocaleString()}</span>
                        </div>
                        <h4>{req.units} Unit{req.units > 1 ? 's' : ''} of {req.blood_type} for {req.patient_name || 'Patient'}</h4>
                        <p className="text-sm text-gray-400">{req.notes}</p>
                    </div>
                    <div className="request-actions flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => onFulfill && onFulfill(req.id)}>
                            ✅ Fulfill
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => onMatch(req)}>
                            Find Donors
                        </button>
                        <button className="btn btn-outline btn-sm text-red-500 border-red-500" onClick={() => onCancel(req.id)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MatchedDonors({ donors }) {
    if (donors.length === 0) {
        return <div className="p-4 text-center text-gray-400">No matching donors found nearby.</div>;
    }

    return (
        <div className="donors-grid mt-4">
            {donors.map(donor => (
                <DonorCard key={donor.id} donor={donor} onContact={(d) => window.open(`tel:${d.phone}`)} />
            ))}
        </div>
    );
}

export function BloodInventoryGrid() {
    // Mock state for visual demo, in real app this would sync with backend
    const [inventory, setInventory] = useState({
        'A+': 'High', 'A-': 'Medium',
        'B+': 'High', 'B-': 'Low',
        'AB+': 'Medium', 'AB-': 'Critical',
        'O+': 'High', 'O-': 'Critical'
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'High': return 'text-green-500 border-green-500/30 bg-green-500/10';
            case 'Medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
            case 'Low': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
            case 'Critical': return 'text-red-500 border-red-500/30 bg-red-500/10';
            default: return 'text-gray-500';
        }
    };

    const styles = {
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem' },
        card: { padding: '1rem', borderRadius: '0.75rem', border: '1px solid', textAlign: 'center', transition: 'all 0.2s' },
        type: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' },
        status: { fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' },
        select: { marginTop: '0.5rem', width: '100%', padding: '0.25rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', borderRadius: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }
    };

    return (
        <div className="inventory-section">
            <h3 className="text-xl font-bold mb-4">Blood Stock Status</h3>
            <div style={styles.grid}>
                {Object.entries(inventory).map(([type, status]) => (
                    <div key={type} style={styles.card} className={getStatusColor(status)}>
                        <div style={styles.type}>{type}</div>
                        <div style={styles.status}>{status}</div>
                        <select
                            style={styles.select}
                            value={status}
                            onChange={(e) => setInventory(prev => ({ ...prev, [type]: e.target.value }))}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}
