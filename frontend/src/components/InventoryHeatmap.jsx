import { useState } from 'react';
import './InventoryHeatmap.css';

/**
 * Inventory Heatmap - Visual grid of blood types with color-coded stock levels
 */
export function InventoryHeatmap({ batches }) {
    const [selectedType, setSelectedType] = useState(null);
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Calculate totals per blood type (only non-expired)
    const getStockData = () => {
        const data = {};
        bloodTypes.forEach(type => {
            const validBatches = batches?.filter(b =>
                b.blood_type === type && new Date(b.expiry_date) > new Date()
            ) || [];

            const totalUnits = validBatches.reduce((sum, b) => sum + b.units, 0);
            const expiringSoon = validBatches.filter(b => {
                const daysToExpiry = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                return daysToExpiry <= 7;
            }).reduce((sum, b) => sum + b.units, 0);

            data[type] = {
                total: totalUnits,
                expiringSoon,
                batches: validBatches.length
            };
        });
        return data;
    };

    const stockData = getStockData();

    const getStockLevel = (units) => {
        if (units === 0) return 'empty';
        if (units < 5) return 'critical';
        if (units < 10) return 'low';
        if (units < 20) return 'moderate';
        return 'healthy';
    };

    const levelLabels = {
        empty: 'Empty',
        critical: 'Critical',
        low: 'Low',
        moderate: 'Moderate',
        healthy: 'Healthy'
    };

    return (
        <div className="inventory-heatmap">
            <div className="heatmap-header">
                <h3>📊 Inventory Heatmap</h3>
                <div className="heatmap-legend">
                    <span className="legend-item empty">Empty</span>
                    <span className="legend-item critical">Critical</span>
                    <span className="legend-item low">Low</span>
                    <span className="legend-item moderate">Moderate</span>
                    <span className="legend-item healthy">Healthy</span>
                </div>
            </div>

            <div className="heatmap-grid">
                {bloodTypes.map(type => {
                    const data = stockData[type];
                    const level = getStockLevel(data.total);
                    const isSelected = selectedType === type;

                    return (
                        <div
                            key={type}
                            className={`heatmap-tile ${level} ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedType(isSelected ? null : type)}
                        >
                            <div className="tile-blood-type">{type}</div>
                            <div className="tile-units">{data.total}</div>
                            <div className="tile-label">units</div>

                            {data.expiringSoon > 0 && (
                                <div className="tile-expiry-badge">
                                    ⚠ {data.expiringSoon} expiring
                                </div>
                            )}

                            <div className="tile-level-indicator">
                                {levelLabels[level]}
                            </div>

                            {isSelected && (
                                <div className="tile-details">
                                    <p>{data.batches} batch{data.batches !== 1 ? 'es' : ''}</p>
                                    {data.expiringSoon > 0 && (
                                        <p className="text-yellow-500">{data.expiringSoon} expiring within 7 days</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Enhanced Expiry Alerts with FIFO recommendations
 */
export function ExpiryAlertsList({ batches }) {
    // Get batches expiring within 7 days, sorted by expiry date
    const expiringBatches = batches
        ?.filter(b => {
            const daysToExpiry = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            return daysToExpiry > 0 && daysToExpiry <= 7;
        })
        .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)) || [];

    if (expiringBatches.length === 0) {
        return null;
    }

    const getDaysUntilExpiry = (date) => {
        return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    };

    const getUrgencyClass = (days) => {
        if (days <= 2) return 'critical';
        if (days <= 4) return 'urgent';
        return 'warning';
    };

    return (
        <div className="expiry-alerts-section">
            <div className="expiry-header">
                <h3>⏰ Expiry Alerts (FIFO Priority)</h3>
                <span className="expiry-count">{expiringBatches.length} batch{expiringBatches.length !== 1 ? 'es' : ''}</span>
            </div>

            <div className="expiry-list">
                {expiringBatches.map((batch, idx) => {
                    const daysLeft = getDaysUntilExpiry(batch.expiry_date);
                    const urgency = getUrgencyClass(daysLeft);

                    return (
                        <div key={batch.id} className={`expiry-card ${urgency}`}>
                            <div className="expiry-priority">
                                {idx + 1}
                            </div>
                            <div className="expiry-info">
                                <div className="expiry-blood-type">{batch.blood_type}</div>
                                <div className="expiry-units">{batch.units} unit{batch.units !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="expiry-countdown">
                                <span className={`countdown-value ${urgency}`}>
                                    {daysLeft}
                                </span>
                                <span className="countdown-label">day{daysLeft !== 1 ? 's' : ''} left</span>
                            </div>
                            <div className="expiry-action">
                                <button className="btn btn-sm btn-outline">
                                    Dispatch
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fifo-tip">
                💡 <strong>FIFO Tip:</strong> Dispatch items in order above to minimize wastage
            </div>
        </div>
    );
}

/**
 * Donor Radar - Geographic view of registered donors (simplified version)
 */
export function DonorRadar({ donors, selectedBloodType, onSelectDonor }) {
    const filteredDonors = selectedBloodType
        ? donors?.filter(d => d.blood_type === selectedBloodType)
        : donors;

    const availableDonors = filteredDonors?.filter(d => d.available) || [];
    const unavailableDonors = filteredDonors?.filter(d => !d.available) || [];

    return (
        <div className="donor-radar">
            <div className="radar-header">
                <h3>📡 Donor Recruitment Radar</h3>
                <div className="radar-stats">
                    <span className="stat-available">{availableDonors.length} Available</span>
                    <span className="stat-total">{filteredDonors?.length || 0} Total</span>
                </div>
            </div>

            <div className="radar-visualization">
                <div className="radar-ring outer"></div>
                <div className="radar-ring middle"></div>
                <div className="radar-ring inner"></div>
                <div className="radar-center">
                    <span className="center-icon">🏦</span>
                    <span className="center-label">Blood Bank</span>
                </div>

                {availableDonors.slice(0, 8).map((donor, idx) => (
                    <div
                        key={donor.id}
                        className="radar-donor available"
                        style={{
                            '--angle': `${(idx / 8) * 360}deg`,
                            '--distance': `${60 + (idx % 3) * 20}%`
                        }}
                        onClick={() => onSelectDonor?.(donor)}
                        title={`${donor.name} - ${donor.blood_type}`}
                    >
                        <span className="donor-dot">🩸</span>
                    </div>
                ))}
            </div>

            <div className="radar-list">
                <h4>Available Donors ({availableDonors.length})</h4>
                {availableDonors.length === 0 ? (
                    <p className="text-gray-400 text-sm">No available donors for selected type</p>
                ) : (
                    <div className="donor-list-grid">
                        {availableDonors.slice(0, 6).map(donor => (
                            <div key={donor.id} className="radar-donor-card glass-card">
                                <div className="donor-blood-type">{donor.blood_type}</div>
                                <div className="donor-name">{donor.name}</div>
                                <div className="donor-city">{donor.city}</div>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => window.open(`tel:${donor.phone}`)}
                                >
                                    Contact
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default {
    InventoryHeatmap,
    ExpiryAlertsList,
    DonorRadar
};
