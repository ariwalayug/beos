import './BloodTypeCard.css';

function BloodTypeCard({ type, count, available, onClick }) {
    return (
        <div className="blood-type-card glass-card" onClick={onClick}>
            <div className="blood-type-badge">{type}</div>
            <div className="blood-type-info">
                <span className="blood-type-count">{count}</span>
                <span className="blood-type-label">
                    {available ? 'Available Donors' : 'Units Available'}
                </span>
            </div>
        </div>
    );
}

export default BloodTypeCard;
