import { AlertTriangle, Clock, Building2, Phone, Check, X, User } from 'lucide-react';
import './RequestCard.css';

function RequestCard({ request, onFulfill, onCancel }) {
    if (!request) return null;

    const getUrgencyConfig = (urgency) => {
        switch (urgency) {
            case 'critical': return { class: 'badge-critical', icon: AlertTriangle };
            case 'urgent': return { class: 'badge-urgent', icon: AlertTriangle };
            default: return { class: 'badge-normal', icon: Check };
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

    const urgencyConfig = getUrgencyConfig(request.urgency);
    const UrgencyIcon = urgencyConfig.icon;

    return (
        <div className={`request-card-pro ${request.urgency === 'critical' ? 'critical' : ''}`}>
            <div className="request-header">
                <div className="blood-type-badge">{request.blood_type}</div>
                <div className="request-meta-badges">
                    <span className={`badge ${urgencyConfig.class}`}>
                        <UrgencyIcon size={12} /> {request.urgency}
                    </span>
                    <span className={`badge ${getStatusClass(request.status)}`}>
                        {request.status}
                    </span>
                </div>
            </div>

            <div className="request-body">
                <div className="units-display">
                    <span className="units-val">{request.units}</span>
                    <span className="units-lbl">units needed</span>
                </div>

                {request.hospital_name && (
                    <div className="info-row">
                        <Building2 size={16} className="text-muted" />
                        <span>{request.hospital_name}</span>
                    </div>
                )}

                {request.patient_name && (
                    <div className="info-row">
                        <User size={16} className="text-muted" />
                        <span>Patient: {request.patient_name}</span>
                    </div>
                )}

                {request.notes && (
                    <p className="request-notes">{request.notes}</p>
                )}

                <div className="info-row time">
                    <Clock size={14} />
                    <span>{timeAgo(request.created_at)}</span>
                </div>
            </div>

            {request.status === 'pending' && (
                <div className="request-actions">
                    <button className="btn btn-success btn-sm" onClick={() => onFulfill?.(request.id)}>
                        <Check size={16} /> Fulfill
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onCancel?.(request.id)}>
                        <X size={16} /> Cancel
                    </button>
                    {request.contact_phone && (
                        <a href={`tel:${request.contact_phone}`} className="btn btn-outline btn-sm">
                            <Phone size={16} /> Call
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default RequestCard;
