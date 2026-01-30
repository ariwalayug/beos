import React, { useMemo } from 'react';
import { Droplet, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface BloodInventory {
    blood_type: string;
    units: number;
    threshold?: number;
}

interface BloodShortageHeatmapProps {
    inventory: BloodInventory[];
    onCellClick?: (bloodType: string) => void;
    showLabels?: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Default thresholds (units) for shortage levels
const DEFAULT_THRESHOLDS = {
    critical: 5,   // < 5 units = critical
    low: 15,       // < 15 units = low
    adequate: 50   // < 50 units = adequate, else = high
};

function getShortageLevel(units: number, threshold?: number): 'critical' | 'low' | 'adequate' | 'high' {
    const criticalThreshold = threshold ? threshold * 0.2 : DEFAULT_THRESHOLDS.critical;
    const lowThreshold = threshold ? threshold * 0.5 : DEFAULT_THRESHOLDS.low;
    const adequateThreshold = threshold || DEFAULT_THRESHOLDS.adequate;

    if (units <= criticalThreshold) return 'critical';
    if (units <= lowThreshold) return 'low';
    if (units <= adequateThreshold) return 'adequate';
    return 'high';
}

function getLevelStyles(level: 'critical' | 'low' | 'adequate' | 'high') {
    switch (level) {
        case 'critical':
            return {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.2))',
                border: '2px solid rgba(239, 68, 68, 0.7)',
                color: '#fca5a5',
                glow: '0 0 20px rgba(239, 68, 68, 0.4)'
            };
        case 'low':
            return {
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(180, 83, 9, 0.15))',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#fcd34d',
                glow: 'none'
            };
        case 'adequate':
            return {
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#86efac',
                glow: 'none'
            };
        case 'high':
            return {
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
                glow: 'none'
            };
    }
}

export function BloodShortageHeatmap({
    inventory,
    onCellClick,
    showLabels = true
}: BloodShortageHeatmapProps) {
    // Create inventory map for quick lookup
    const inventoryMap = useMemo(() => {
        const map = new Map<string, BloodInventory>();
        inventory.forEach(item => map.set(item.blood_type, item));
        return map;
    }, [inventory]);

    // Summary stats
    const stats = useMemo(() => {
        let critical = 0, low = 0, adequate = 0, total = 0;
        BLOOD_TYPES.forEach(type => {
            const item = inventoryMap.get(type);
            const units = item?.units || 0;
            const level = getShortageLevel(units, item?.threshold);
            total += units;
            if (level === 'critical') critical++;
            else if (level === 'low') low++;
            else adequate++;
        });
        return { critical, low, adequate, total };
    }, [inventoryMap]);

    return (
        <div className="cc-panel">
            <div className="cc-panel-header">
                <div className="cc-panel-title">
                    <Droplet size={16} />
                    Blood Inventory Status
                </div>
                {stats.critical > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        borderRadius: '9999px',
                        color: '#ef4444',
                        fontSize: '0.6875rem',
                        fontWeight: 700
                    }}>
                        <AlertTriangle size={12} />
                        {stats.critical} CRITICAL
                    </div>
                )}
            </div>
            <div className="cc-panel-body">
                {/* Heatmap Grid */}
                <div className="cc-blood-grid">
                    {BLOOD_TYPES.map(type => {
                        const item = inventoryMap.get(type);
                        const units = item?.units || 0;
                        const level = getShortageLevel(units, item?.threshold);
                        const styles = getLevelStyles(level);

                        return (
                            <div
                                key={type}
                                className={`cc-blood-cell ${level}`}
                                onClick={() => onCellClick?.(type)}
                                style={{
                                    background: styles.background,
                                    border: styles.border,
                                    boxShadow: styles.glow,
                                    cursor: onCellClick ? 'pointer' : 'default',
                                    animation: level === 'critical' ? 'pulse-critical 2s infinite' : 'none'
                                }}
                            >
                                <div className="cc-blood-type" style={{ color: styles.color }}>
                                    {type}
                                </div>
                                <div className="cc-blood-units">
                                    {units} units
                                </div>
                                {level === 'critical' && (
                                    <TrendingDown size={14} style={{ color: '#ef4444', marginTop: 4 }} />
                                )}
                                {level === 'high' && (
                                    <TrendingUp size={14} style={{ color: '#3b82f6', marginTop: 4 }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                {showLabels && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--cc-border)'
                    }}>
                        {[
                            { level: 'critical', label: 'Critical', color: '#ef4444' },
                            { level: 'low', label: 'Low', color: '#f59e0b' },
                            { level: 'adequate', label: 'Adequate', color: '#22c55e' },
                            { level: 'high', label: 'High', color: '#3b82f6' }
                        ].map(item => (
                            <div key={item.level} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                fontSize: '0.6875rem',
                                color: 'var(--cc-text-muted)'
                            }}>
                                <div style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 2,
                                    backgroundColor: item.color
                                }} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Total */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--cc-text-muted)'
                }}>
                    Total Inventory: <strong style={{ color: 'var(--cc-text-primary)' }}>{stats.total}</strong> units
                </div>
            </div>
        </div>
    );
}

export default BloodShortageHeatmap;
