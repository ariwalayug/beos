import './EmergencyBanner.css';
import { AlertCircle, ArrowRight } from 'lucide-react';

function EmergencyBanner({ requests = [] }) {
    const criticalCount = requests.filter(r => r.urgency === 'critical' && r.status === 'pending').length;

    if (criticalCount === 0) return null;

    return (
        <div className="emergency-banner">
            <div className="container emergency-banner-content">
                <div className="emergency-pulse"></div>
                <div className="emergency-text">
                    <AlertCircle size={18} className="banner-icon" />
                    <span className="banner-label">CRITICAL ALERT:</span>
                    <span>{criticalCount} urgent blood request{criticalCount > 1 ? 's' : ''} need immediate attention!</span>
                </div>
                <a href="/emergency" className="btn-view-requests">
                    View Requests <ArrowRight size={16} />
                </a>
            </div>
        </div>
    );
}

export default EmergencyBanner;
