import { useState, useEffect } from 'react';
import { getBloodBanks } from '../services/api';
import './BloodBanks.css';

function BloodBanks() {
    const [bloodBanks, setBloodBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
        if (units <= 5) return { label: 'Critical', class: 'critical' };
        if (units <= 15) return { label: 'Low', class: 'low' };
        return { label: 'Good', class: 'good' };
    };

    return (
        <div className="bloodbanks-page masterpiece">
            {/* Background Effects */}
            <div className="page-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="container section">
                <header className="page-header animate-slide-up">
                    <div className="header-badge">
                        <span className="badge-icon">🏦</span>
                        <span>Inventory Network</span>
                    </div>
                    <h1 className="page-title">
                        Blood Bank
                        <span className="text-gradient-animated"> Logistics</span>
                    </h1>
                    <p className="page-subtitle">
                        Real-time inventory levels across the entire donation network.
                    </p>
                </header>

                {/* Controls */}
                <div className="controls-bar glass-card animate-slide-up delay-1">
                    <div className="refresh-control">
                        <span className="last-updated">
                            <span className="pulse-dot online"></span>
                            Live Inventory
                        </span>
                    </div>
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            📊 Heatmap
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            📋 List
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="results-section animate-fade-in delay-2">
                    {loading ? (
                        <div className="loading-grid">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="skeleton-card bank-skeleton">
                                    <div className="skeleton-header">
                                        <div className="skeleton-avatar"></div>
                                        <div className="skeleton-lines">
                                            <div className="skeleton-line long"></div>
                                            <div className="skeleton-line short"></div>
                                        </div>
                                    </div>
                                    <div className="skeleton-grid"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="error-state glass-card">
                            <span className="error-icon">⚠️</span>
                            <h3>Unable to load inventory data</h3>
                            <button className="btn btn-primary" onClick={fetchBloodBanks}>Retry</button>
                        </div>
                    ) : bloodBanks.length === 0 ? (
                        <div className="empty-state glass-card">
                            <span className="empty-icon">🏦</span>
                            <h3>No blood banks found</h3>
                        </div>
                    ) : (
                        <div className={`bloodbanks-grid ${viewMode}`}>
                            {bloodBanks.map((bank, index) => (
                                <div
                                    key={bank.id}
                                    className="bloodbank-card glass-card"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="bank-header">
                                        <div className="bank-icon-wrapper">
                                            <span className="bank-icon">🏦</span>
                                        </div>
                                        <div className="bank-details">
                                            <h3>{bank.name}</h3>
                                            <p className="bank-location">📍 {bank.city}</p>
                                        </div>
                                        <a href={`tel:${bank.phone}`} className="btn-call">
                                            📞
                                        </a>
                                    </div>

                                    <div className="inventory-heatmap">
                                        {bank.inventory && bank.inventory.map(item => {
                                            const status = getInventoryStatus(item.units);
                                            return (
                                                <div
                                                    key={item.blood_type}
                                                    className={`heatmap-cell ${status.class}`}
                                                    title={`${item.blood_type}: ${item.units} units (${status.label})`}
                                                >
                                                    <span className="blood-type">{item.blood_type}</span>
                                                    <span className="blood-units">{item.units}</span>
                                                    <div className="cell-glow"></div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="bank-footer">
                                        <div className="status-legend">
                                            <div className="legend-item"><span className="dot good"></span>Healthy</div>
                                            <div className="legend-item"><span className="dot low"></span>Low</div>
                                            <div className="legend-item"><span className="dot critical"></span>Critical</div>
                                        </div>
                                        <span className="update-time">Updated 2m ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BloodBanks;
