import { useState } from 'react';

export function AvailabilityToggle({ available, onToggle, loading }) {
    return (
        <div className="availability-toggle glass-card">
            <div>
                <p className="toggle-label">Available to Donate</p>
                <p className="text-sm text-gray-400">
                    {available
                        ? "You are visible to hospitals and blood banks."
                        : "You are currently hidden from search results."}
                </p>
            </div>
            <label className="switch">
                <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => onToggle(e.target.checked)}
                    disabled={loading}
                />
                <span className="slider round"></span>
            </label>
        </div>
    );
}

export function ProfileEditor({ profile, onSave, loading }) {
    // Safe default: return null if profile is missing
    if (!profile) {
        return null;
    }

    const [formData, setFormData] = useState({
        name: profile.name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        address: profile.address || '',
        blood_type: profile.blood_type || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select
                        name="blood_type"
                        className="form-select"
                        value={formData.blood_type}
                        onChange={handleChange}
                        disabled // Usually changing blood type requires verification
                    >
                        <option value={formData.blood_type}>{formData.blood_type}</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                        type="text"
                        name="city"
                        className="form-input"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Address (Optional)</label>
                    <textarea
                        name="address"
                        className="form-textarea"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                    />
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-400">Blood type cannot be changed. Contact support for assistance.</p>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

export function RequestCard({ request, onFulfill }) {
    // Safe default: return null if request is missing
    if (!request) {
        return null;
    }

    const isCritical = request.urgency === 'critical';

    return (
        <div className={`glass-card request-card ${request.urgency}`}>
            <div className="request-info">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`badge badge-${request.urgency}`}>{request.urgency}</span>
                    <span className="text-sm text-gray-400">#{request.id}</span>
                    <span className="text-sm text-gray-400">• {new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                <h4>{request.units} Unit{request.units > 1 ? 's' : ''} of {request.blood_type} Blood Required</h4>
                <div className="request-meta">
                    <span className="request-hospital">🏥 {request.hospital_name}, {request.hospital_city}</span>
                    <span>📞 {request.contact_phone || 'Contact Hospital'}</span>
                </div>
                {request.notes && <p className="text-sm text-gray-400 mt-2">Note: {request.notes}</p>}
            </div>
            <div className="request-actions">
                {request.status === 'pending' ? (
                    <button className="btn btn-primary" onClick={() => onFulfill(request.id)}>
                        I Can Donating
                    </button>
                ) : (
                    <span className="badge badge-fulfilled">Fulfilled</span>
                )}
            </div>
        </div>
    );
}
