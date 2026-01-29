import { useState } from 'react';
import './LiveRequestTracker.css';

/**
 * Live Request Tracker - Shows real-time status of blood requests
 * with visual timeline: Requested → Dispatching → En Route → Arrived
 */
export function LiveRequestTracker({ requests, onRequestClick }) {
    const stages = ['requested', 'dispatching', 'enroute', 'arrived'];
    const stageLabels = {
        requested: 'Requested',
        dispatching: 'Dispatching',
        enroute: 'En Route',
        arrived: 'Arrived'
    };

    const getStageIndex = (status) => {
        const statusMap = {
            'pending': 0,
            'dispatching': 1,
            'in_transit': 2,
            'enroute': 2,
            'arrived': 3,
            'fulfilled': 3
        };
        return statusMap[status?.toLowerCase()] || 0;
    };

    if (!requests || requests.length === 0) {
        return (
            <div className="tracker-empty glass-card">
                <div className="tracker-empty-icon">📡</div>
                <p>No active requests to track</p>
                <span className="text-sm text-gray-400">New requests will appear here in real-time</span>
            </div>
        );
    }

    return (
        <div className="live-tracker">
            <div className="tracker-header">
                <h3>🔴 Live Request Tracker</h3>
                <span className="live-indicator">
                    <span className="pulse-dot"></span>
                    LIVE
                </span>
            </div>

            <div className="tracker-list">
                {requests.map(req => {
                    const currentStage = getStageIndex(req.status);
                    const isCritical = req.urgency === 'critical';

                    return (
                        <div
                            key={req.id}
                            className={`tracker-card glass-card ${isCritical ? 'critical' : ''}`}
                            onClick={() => onRequestClick?.(req)}
                        >
                            <div className="tracker-card-header">
                                <div className="tracker-info">
                                    <span className={`badge badge-${req.urgency}`}>{req.urgency}</span>
                                    <span className="tracker-blood-type">{req.blood_type}</span>
                                    <span className="tracker-units">{req.units} unit{req.units > 1 ? 's' : ''}</span>
                                </div>
                                <span className="tracker-id">#{req.id}</span>
                            </div>

                            <div className="tracker-patient">
                                <span>Patient: <strong>{req.patient_name || 'Anonymous'}</strong></span>
                            </div>

                            <div className="tracker-timeline">
                                {stages.map((stage, idx) => (
                                    <div key={stage} className="timeline-stage">
                                        <div
                                            className={`stage-dot ${idx <= currentStage ? 'active' : ''} ${idx === currentStage ? 'current' : ''}`}
                                        >
                                            {idx < currentStage && '✓'}
                                            {idx === currentStage && (
                                                <span className="stage-pulse"></span>
                                            )}
                                        </div>
                                        <span className={`stage-label ${idx <= currentStage ? 'active' : ''}`}>
                                            {stageLabels[stage]}
                                        </span>
                                        {idx < stages.length - 1 && (
                                            <div className={`stage-connector ${idx < currentStage ? 'active' : ''}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="tracker-meta">
                                <span className="tracker-time">
                                    Created: {new Date(req.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Mass Casualty Trigger - Big Red Button for crisis mode
 */
export function MassCasualtyTrigger({ onTrigger, isActive, loading }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleTrigger = () => {
        if (isActive) {
            // Deactivate crisis mode
            onTrigger(false);
            setShowConfirm(false);
        } else {
            setShowConfirm(true);
        }
    };

    const handleConfirm = () => {
        onTrigger(true);
        setShowConfirm(false);
    };

    return (
        <div className={`crisis-trigger ${isActive ? 'active' : ''}`}>
            <div className="crisis-content">
                <div className="crisis-info">
                    <h3>{isActive ? '🚨 CRISIS MODE ACTIVE' : '⚠️ Mass Casualty Protocol'}</h3>
                    <p className="text-sm text-gray-400">
                        {isActive
                            ? 'All nearby blood banks and donors are being notified'
                            : 'Activate to broadcast emergency to all nearby resources'
                        }
                    </p>
                </div>

                {!showConfirm ? (
                    <button
                        className={`crisis-btn ${isActive ? 'deactivate' : 'activate'}`}
                        onClick={handleTrigger}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : isActive ? 'DEACTIVATE' : 'ACTIVATE PROTOCOL'}
                    </button>
                ) : (
                    <div className="crisis-confirm">
                        <p className="confirm-text">⚠️ This will notify ALL nearby donors and blood banks immediately.</p>
                        <div className="confirm-actions">
                            <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button className="crisis-btn activate" onClick={handleConfirm}>
                                CONFIRM ACTIVATION
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isActive && (
                <div className="crisis-pulse-ring"></div>
            )}
        </div>
    );
}

/**
 * Hospital Stats Grid - Quick metrics overview
 */
export function HospitalStatsGrid({ requests, profile }) {
    const criticalCount = requests?.filter(r => r.urgency === 'critical').length || 0;
    const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;
    const fulfilledToday = requests?.filter(r => {
        const today = new Date().toDateString();
        return r.fulfilled_at && new Date(r.fulfilled_at).toDateString() === today;
    }).length || 0;

    return (
        <div className="hospital-stats-grid">
            <div className="hospital-stat glass-card">
                <span className="stat-icon">📋</span>
                <div className="stat-content">
                    <span className="stat-value">{pendingCount}</span>
                    <span className="stat-label">Active Requests</span>
                </div>
            </div>
            <div className="hospital-stat glass-card critical">
                <span className="stat-icon">🚨</span>
                <div className="stat-content">
                    <span className="stat-value text-red-500">{criticalCount}</span>
                    <span className="stat-label">Critical</span>
                </div>
            </div>
            <div className="hospital-stat glass-card">
                <span className="stat-icon">✅</span>
                <div className="stat-content">
                    <span className="stat-value text-green-500">{fulfilledToday}</span>
                    <span className="stat-label">Fulfilled Today</span>
                </div>
            </div>
            <div className="hospital-stat glass-card">
                <span className="stat-icon">🏥</span>
                <div className="stat-content">
                    <span className="stat-value">{profile?.city || 'N/A'}</span>
                    <span className="stat-label">Location</span>
                </div>
            </div>
        </div>
    );
}

export default {
    LiveRequestTracker,
    MassCasualtyTrigger,
    HospitalStatsGrid
};
