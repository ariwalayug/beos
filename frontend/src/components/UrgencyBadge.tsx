import React from 'react';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

interface UrgencyBadgeProps {
    level: 'critical' | 'urgent' | 'normal';
    pulse?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

const URGENCY_CONFIG = {
    critical: {
        label: 'CRITICAL',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        icon: Zap
    },
    urgent: {
        label: 'URGENT',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        icon: AlertTriangle
    },
    normal: {
        label: 'NORMAL',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        icon: Clock
    }
};

const SIZE_CLASSES = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5'
};

export function UrgencyBadge({
    level,
    pulse = false,
    size = 'md',
    showIcon = true,
    className = ''
}: UrgencyBadgeProps) {
    const config = URGENCY_CONFIG[level];
    const Icon = config.icon;

    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.color,
        borderRadius: '9999px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap' as const
    };

    const pulseAnimation = pulse && level === 'critical' ? {
        animation: 'pulse-badge 1.5s infinite'
    } : {};

    return (
        <>
            {pulse && level === 'critical' && (
                <style>{`
                    @keyframes pulse-badge {
                        0%, 100% { 
                            opacity: 1;
                            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
                        }
                        50% { 
                            opacity: 0.9;
                            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
                        }
                    }
                `}</style>
            )}
            <span
                className={`${SIZE_CLASSES[size]} ${className}`}
                style={{ ...baseStyles, ...pulseAnimation }}
            >
                {showIcon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
                {config.label}
            </span>
        </>
    );
}

// Timer component for critical requests
interface UrgencyTimerProps {
    createdAt: string;
    urgency: 'critical' | 'urgent' | 'normal';
}

export function UrgencyTimer({ createdAt, urgency }: UrgencyTimerProps) {
    const [elapsed, setElapsed] = React.useState('');

    React.useEffect(() => {
        const updateTimer = () => {
            const created = new Date(createdAt).getTime();
            const now = Date.now();
            const diff = Math.floor((now - created) / 1000);

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            if (hours > 0) {
                setElapsed(`${hours}h ${minutes}m`);
            } else if (minutes > 0) {
                setElapsed(`${minutes}m ${seconds}s`);
            } else {
                setElapsed(`${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    const color = urgency === 'critical' ? '#ef4444' :
        urgency === 'urgent' ? '#f59e0b' : '#64748b';

    return (
        <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            color,
            fontWeight: 600
        }}>
            {elapsed}
        </span>
    );
}

export default UrgencyBadge;
