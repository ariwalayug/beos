import './DonorCard.css';

function DonorCard({ donor, onContact }) {
    // Safe default: return null if donor is missing
    if (!donor) {
        return null;
    }

    return (
        <div className="donor-card glass-card">
            <div className="donor-header">
                <div className="donor-blood-type">{donor.blood_type}</div>
                <div className={`donor-status ${donor.available ? 'available' : 'unavailable'}`}>
                    {donor.available ? 'Available' : 'Unavailable'}
                </div>
            </div>

            <div className="donor-body">
                <h3 className="donor-name">{donor.name}</h3>
                <p className="donor-location">📍 {donor.city}</p>
                {donor.last_donation && (
                    <p className="donor-last">Last donation: {new Date(donor.last_donation).toLocaleDateString()}</p>
                )}
            </div>

            <div className="donor-actions">
                {donor.available && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onContact?.(donor)}
                    >
                        Contact Donor
                    </button>
                )}
                <a href={`tel:${donor.phone}`} className="btn btn-secondary btn-sm">
                    📞 Call
                </a>
            </div>
        </div>
    );
}

export default DonorCard;
