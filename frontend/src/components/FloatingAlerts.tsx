import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    AlertTriangle,
    Zap,
    MapPin,
    Clock,
    Check,
    XCircle,
    Droplet,
    Heart
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import './FloatingAlerts.css';

function FloatingAlert({ alert, onAccept, onDecline, onDismiss }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onDismiss(alert.id);
                    return 0;
                }
                return prev - 1;
            });
            setProgress(prev => prev - (100 / 60));
        }, 1000);

        return () => clearInterval(interval);
    }, [alert.id, onDismiss]);

    const getUrgencyConfig = () => {
        switch (alert.urgency) {
            case 'critical':
                return {
                    icon: Zap,
                    label: 'CRITICAL',
                    className: 'urgency-critical',
                    borderClass: 'border-critical'
                };
            case 'urgent':
                return {
                    icon: AlertTriangle,
                    label: 'URGENT',
                    className: 'urgency-urgent',
                    borderClass: 'border-urgent'
                };
            default:
                return {
                    icon: Droplet,
                    label: 'NORMAL',
                    className: 'urgency-normal',
                    borderClass: 'border-normal'
                };
        }
    };

    const urgency = getUrgencyConfig();
    const UrgencyIcon = urgency.icon;

    return (
        <motion.div
            className={`floating-alert ${urgency.borderClass}`}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            layout
        >
            {/* Progress Bar */}
            <div className="alert-progress-bar">
                <motion.div
                    className="alert-progress-fill"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                />
            </div>

            <button className="alert-dismiss" onClick={() => onDismiss(alert.id)}>
                <X size={16} />
            </button>

            {/* Header */}
            <div className="alert-header">
                <div className={`urgency-badge ${urgency.className}`}>
                    <UrgencyIcon size={14} />
                    <span>{urgency.label}</span>
                </div>
                <div className="alert-timer">
                    <Clock size={14} />
                    <span>{timeLeft}s</span>
                </div>
            </div>

            {/* Content */}
            <div className="alert-content">
                <div className="blood-type-badge">
                    <Droplet size={16} />
                    <span>{alert.blood_type}</span>
                </div>
                <div className="alert-details">
                    <h4 className="alert-title">Blood Request</h4>
                    <p className="alert-subtitle">
                        {alert.units} unit{alert.units > 1 ? 's' : ''} needed
                        {alert.patient_name && ` for ${alert.patient_name}`}
                    </p>
                </div>
            </div>

            {/* Location */}
            {alert.location && (
                <div className="alert-location">
                    <MapPin size={14} />
                    <span>{alert.location}</span>
                </div>
            )}

            {/* Actions */}
            <div className="alert-actions">
                <motion.button
                    className="alert-btn accept"
                    onClick={() => onAccept(alert)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Check size={18} />
                    Accept
                </motion.button>
                <motion.button
                    className="alert-btn decline"
                    onClick={() => onDecline(alert)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <XCircle size={18} />
                    Decline
                </motion.button>
            </div>
        </motion.div>
    );
}

interface FloatingAlertsProps {
    onAccept?: (alert: unknown) => void;
    onDecline?: (alert: unknown) => void;
}

interface Alert {
    id: number | string;
    blood_type: string;
    units: number;
    urgency: string;
    patient_name: string;
    location: string;
    hospital_name?: string;
    createdAt: Date;
}

function FloatingAlerts({ onAccept, onDecline }: FloatingAlertsProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const { isConnected, subscribe } = useSocket();

    // Listen for real-time emergency alerts
    useEffect(() => {
        if (!isConnected) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleNewRequest = (request: any) => {
            // Only show alerts for matching blood types or critical requests
            if (request.urgency === 'critical') {
                addAlert(request);
            }
        };

        const unsubscribeNew = subscribe('new_request', handleNewRequest);
        const unsubscribeBroadcast = subscribe('emergency_broadcast', handleNewRequest);

        return () => {
            unsubscribeNew();
            unsubscribeBroadcast();
        };
    }, [isConnected, subscribe]);

    const addAlert = (request: any) => {
        const alert: Alert = {
            id: request.id || Date.now(),
            blood_type: request.blood_type,
            units: request.units,
            urgency: request.urgency,
            patient_name: request.patient_name,
            location: request.location || 'Nearby Hospital',
            hospital_name: request.hospital_name,
            createdAt: new Date()
        };

        setAlerts(prev => {
            // Limit to 3 alerts max
            const newAlerts = [alert, ...prev].slice(0, 3);
            return newAlerts;
        });
    };

    const handleDismiss = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const handleAccept = (alert) => {
        if (onAccept) onAccept(alert);
        handleDismiss(alert.id);
    };

    const handleDecline = (alert) => {
        if (onDecline) onDecline(alert);
        handleDismiss(alert.id);
    };

    // Demo: Add test alert after 5 seconds for development
    useEffect(() => {
        if (import.meta.env.MODE === 'development') {
            const timeout = setTimeout(() => {
                // Uncomment to test alerts
                // addAlert({
                //     id: Date.now(),
                //     blood_type: 'O-',
                //     units: 2,
                //     urgency: 'critical',
                //     patient_name: 'Emergency Patient',
                //     location: 'City Hospital'
                // });
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, []);

    if (alerts.length === 0) return null;

    return (
        <div className="floating-alerts-container">
            <AnimatePresence>
                {alerts.map(alert => (
                    <FloatingAlert
                        key={alert.id}
                        alert={alert}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        onDismiss={handleDismiss}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

export default FloatingAlerts;
