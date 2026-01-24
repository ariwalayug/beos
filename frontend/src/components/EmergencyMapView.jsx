import { useState, useEffect } from 'react';
import './EmergencyMapView.css';

/**
 * Emergency Map View - Shows nearby emergency requests with pulsing indicators
 * This is a simplified visualization without actual map library (can be enhanced with Leaflet)
 */
export function EmergencyMapView({ requests, donorCity, onRespond }) {
    const criticalRequests = requests?.filter(r => r.urgency === 'critical') || [];
    const urgentRequests = requests?.filter(r => r.urgency === 'urgent') || [];
    const normalRequests = requests?.filter(r => r.urgency === 'normal') || [];

    return (
        <div className="emergency-map-view">
            <div className="map-header">
                <h3>🗺️ Emergency Map</h3>
                <div className="map-legend">
                    <span className="legend-item critical">
                        <span className="legend-dot critical"></span>
                        Critical ({criticalRequests.length})
                    </span>
                    <span className="legend-item urgent">
                        <span className="legend-dot urgent"></span>
                        Urgent ({urgentRequests.length})
                    </span>
                    <span className="legend-item normal">
                        <span className="legend-dot normal"></span>
                        Normal ({normalRequests.length})
                    </span>
                </div>
            </div>

            <div className="map-container">
                {/* Radar visualization */}
                <div className="radar-base">
                    <div className="radar-ring ring-1"></div>
                    <div className="radar-ring ring-2"></div>
                    <div className="radar-ring ring-3"></div>
                    <div className="radar-sweep"></div>

                    {/* Center - You */}
                    <div className="map-center">
                        <span className="center-icon">📍</span>
                        <span className="center-label">You ({donorCity})</span>
                    </div>

                    {/* Emergency Points */}
                    {criticalRequests.slice(0, 5).map((req, idx) => (
                        <div
                            key={req.id}
                            className="emergency-point critical"
                            style={{
                                '--angle': `${(idx / 5) * 360 + 30}deg`,
                                '--distance': '35%'
                            }}
                            onClick={() => onRespond?.(req)}
                        >
                            <span className="point-pulse"></span>
                            <span className="point-icon">🚨</span>
                        </div>
                    ))}

                    {urgentRequests.slice(0, 4).map((req, idx) => (
                        <div
                            key={req.id}
                            className="emergency-point urgent"
                            style={{
                                '--angle': `${(idx / 4) * 360 + 60}deg`,
                                '--distance': '55%'
                            }}
                            onClick={() => onRespond?.(req)}
                        >
                            <span className="point-icon">⚠️</span>
                        </div>
                    ))}

                    {normalRequests.slice(0, 3).map((req, idx) => (
                        <div
                            key={req.id}
                            className="emergency-point normal"
                            style={{
                                '--angle': `${(idx / 3) * 360 + 45}deg`,
                                '--distance': '75%'
                            }}
                            onClick={() => onRespond?.(req)}
                        >
                            <span className="point-icon">📋</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Request List */}
            <div className="map-request-list">
                <h4>Active Emergencies Nearby</h4>
                {requests?.length === 0 ? (
                    <div className="no-emergencies">
                        <span className="check-icon">✅</span>
                        <p>All clear! No emergencies in your area.</p>
                    </div>
                ) : (
                    <div className="request-cards">
                        {requests?.slice(0, 5).map(req => (
                            <div key={req.id} className={`map-request-card ${req.urgency}`}>
                                <div className="request-header">
                                    <span className={`urgency-badge ${req.urgency}`}>{req.urgency}</span>
                                    <span className="blood-type">{req.blood_type}</span>
                                </div>
                                <div className="request-details">
                                    <p className="hospital-name">{req.hospital_name}</p>
                                    <p className="units-needed">{req.units} unit{req.units > 1 ? 's' : ''} needed</p>
                                </div>
                                <button
                                    className="respond-btn"
                                    onClick={() => onRespond?.(req)}
                                >
                                    Respond
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Mission Control Header - Enhanced status display for donors
 */
export function MissionControlHeader({ profile, available, onToggle, stats, loading }) {
    const getRank = (donationCount) => {
        if (donationCount >= 50) return { title: 'Guardian Angel', icon: '👼', color: '#ffd700' };
        if (donationCount >= 25) return { title: 'Hero', icon: '🦸', color: '#c0c0c0' };
        if (donationCount >= 10) return { title: 'Lifesaver', icon: '💪', color: '#cd7f32' };
        if (donationCount >= 5) return { title: 'Responder', icon: '🏃', color: '#4ade80' };
        return { title: 'Rookie', icon: '🌟', color: '#60a5fa' };
    };

    const rank = getRank(stats?.totalDonations || 0);

    return (
        <div className="mission-control-header">
            <div className="mission-welcome">
                <div className="welcome-text">
                    <h1>Welcome back, {profile?.name?.split(' ')[0]}! 👋</h1>
                    <p className="subtitle">Mission Control • First Responder Network</p>
                </div>
                <div className="rank-badge" style={{ '--rank-color': rank.color }}>
                    <span className="rank-icon">{rank.icon}</span>
                    <span className="rank-title">{rank.title}</span>
                </div>
            </div>

            <div className="mission-status-bar">
                <div className={`status-indicator ${available ? 'available' : 'unavailable'}`}>
                    <span className="status-dot"></span>
                    <span className="status-text">
                        {available ? 'READY FOR MISSION' : 'OFF DUTY'}
                    </span>
                </div>

                <div className="availability-toggle-control">
                    <label className="toggle-wrapper">
                        <input
                            type="checkbox"
                            checked={available}
                            onChange={(e) => onToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <span className="toggle-track">
                            <span className="toggle-thumb"></span>
                        </span>
                    </label>
                </div>
            </div>

            <div className="mission-stats">
                <div className="mission-stat">
                    <span className="stat-value">{profile?.blood_type}</span>
                    <span className="stat-label">Blood Type</span>
                </div>
                <div className="mission-stat">
                    <span className="stat-value">{stats?.totalDonations || 0}</span>
                    <span className="stat-label">Lives Saved</span>
                </div>
                <div className="mission-stat">
                    <span className="stat-value">{stats?.nearbyEmergencies || 0}</span>
                    <span className="stat-label">Nearby Alerts</span>
                </div>
                <div className="mission-stat">
                    <span className="stat-value">{profile?.city}</span>
                    <span className="stat-label">Location</span>
                </div>
            </div>
        </div>
    );
}

export default {
    EmergencyMapView,
    MissionControlHeader
};
