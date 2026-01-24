import './RequestCard.css';

function RequestCard({ request, onFulfill, onCancel }) {
    // Safe default: return null if request is missing
    if (!request) {
        return null;
    }

    const getUrgencyClass = (urgency) => {
        switch (urgency) {
            case 'critical': return 'badge-critical';
            case 'urgent': return 'badge-urgent';
            default: return 'badge-normal';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'fulfilled': return 'badge-fulfilled';
            case 'cancelled': return 'badge-pending';
            default: return 'badge-pending';
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className={`request-card glass-card ${request.urgency === 'critical' ? 'critical' : ''}`}>
            <div className="request-header">
                <div className="request-blood-type">{request.blood_type}</div>
                <div className="request-badges">
                    <span className={`badge ${getUrgencyClass(request.urgency)}`}>
                        {request.urgency}
                    </span>
                    <span className={`badge ${getStatusClass(request.status)}`}>
                        {request.status}
                    </span>
                </div>
            </div>

            <div className="request-body">
                <div className="request-units">
                    <span className="units-number">{request.units}</span>
                    <span className="units-label">units needed</span>
                </div>

                {request.hospital_name && (
                    <p className="request-hospital">🏥 {request.hospital_name}</p>
                )}

                {request.patient_name && (
                    <p className="request-patient">Patient: {request.patient_name}</p>
                )}

                {request.notes && (
                    <p className="request-notes">{request.notes}</p>
                )}

                <p className="request-time">{timeAgo(request.created_at)}</p>
            </div>

            {request.status === 'pending' && (
                <div className="request-actions">
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => onFulfill?.(request.id)}
                    >
                        ✓ Fulfill
                    </button>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onCancel?.(request.id)}
                    >
                        Cancel
                    </button>
                    {request.contact_phone && (
                        <a href={`tel:${request.contact_phone}`} className="btn btn-outline btn-sm">
                            📞 Call
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default RequestCard;
