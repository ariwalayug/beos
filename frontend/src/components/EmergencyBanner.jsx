import './EmergencyBanner.css';

function EmergencyBanner({ requests = [] }) {
    const criticalCount = requests.filter(r => r.urgency === 'critical' && r.status === 'pending').length;

    if (criticalCount === 0) return null;

    return (
        <div className="emergency-banner">
            <div className="container emergency-banner-content">
                <div className="emergency-pulse"></div>
                <div className="emergency-text">
                    <strong>⚠️ CRITICAL ALERT:</strong>
                    <span>{criticalCount} urgent blood request{criticalCount > 1 ? 's' : ''} need immediate attention!</span>
                </div>
                <a href="/emergency" className="btn btn-sm btn-danger">
                    View Requests
                </a>
            </div>
        </div>
    );
}

export default EmergencyBanner;
