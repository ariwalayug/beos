import { useState, useEffect } from 'react';
import { getBloodBanks } from '../services/api';
import './BloodBanks.css';

function BloodBanks() {
    const [bloodBanks, setBloodBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBloodBanks();
    }, []);

    const fetchBloodBanks = async () => {
        try {
            setLoading(true);
            const response = await getBloodBanks({ inventory: 'true' });
            setBloodBanks(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getInventoryStatus = (units) => {
        if (units <= 5) return 'critical';
        if (units <= 15) return 'low';
        return 'good';
    };

    return (
        <div className="blood-banks-page">
            <div className="container">
                <header className="page-header">
                    <h1>Blood Banks</h1>
                    <p>Check real-time blood availability across blood banks</p>
                </header>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading blood banks...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>Error: {error}</p>
                        <button className="btn btn-primary" onClick={fetchBloodBanks}>Retry</button>
                    </div>
                ) : bloodBanks.length === 0 ? (
                    <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h3>No Blood Banks Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>No blood banks are registered in the system yet.</p>
                    </div>
                ) : (
                    <div className="blood-banks-list">
                        {bloodBanks.map(bank => (
                            <div key={bank.id} className="blood-bank-card glass-card">
                                <div className="bank-header">
                                    <div className="bank-icon">🏦</div>
                                    <div className="bank-info">
                                        <h3>{bank.name}</h3>
                                        <p className="bank-address">{bank.address}, {bank.city}</p>
                                        <p className="bank-hours">⏰ {bank.operating_hours || 'Contact for hours'}</p>
                                    </div>
                                    <div className="bank-contact">
                                        <a href={`tel:${bank.phone}`} className="btn btn-primary btn-sm">
                                            📞 Call
                                        </a>
                                    </div>
                                </div>

                                {bank.inventory && (
                                    <div className="bank-inventory">
                                        <h4>Blood Inventory</h4>
                                        <div className="inventory-grid">
                                            {bank.inventory.map(item => (
                                                <div
                                                    key={item.blood_type}
                                                    className={`inventory-item ${getInventoryStatus(item.units)}`}
                                                >
                                                    <span className="inventory-type">{item.blood_type}</span>
                                                    <span className="inventory-units">{item.units}</span>
                                                    <span className="inventory-label">units</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BloodBanks;
