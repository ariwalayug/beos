import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Brain, AlertCircle } from 'lucide-react';

interface PredictionData {
    date: string;
    predicted: number;
    actual?: number;
    confidence: number;
}

interface AIPredictionChartProps {
    data: PredictionData[];
    bloodType?: string;
    title?: string;
}

// Generate mock prediction data if none provided
function generateMockData(): PredictionData[] {
    const data: PredictionData[] = [];
    const today = new Date();

    for (let i = -3; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const baseValue = 20 + Math.random() * 15;
        const trend = i > 4 ? 1.2 : 1; // Spike predicted after day 4

        data.push({
            date: date.toISOString().split('T')[0],
            predicted: Math.round(baseValue * trend),
            actual: i < 0 ? Math.round(baseValue * (0.9 + Math.random() * 0.2)) : undefined,
            confidence: 95 - (Math.abs(i) * 5)
        });
    }

    return data;
}

export function AIPredictionChart({
    data = generateMockData(),
    bloodType = 'O+',
    title = '7-Day Demand Forecast'
}: AIPredictionChartProps) {
    const chartData = useMemo(() => {
        const maxValue = Math.max(...data.map(d => Math.max(d.predicted, d.actual || 0)));
        const minConfidence = Math.min(...data.map(d => d.confidence));
        const avgPredicted = data.reduce((sum, d) => sum + d.predicted, 0) / data.length;

        // Trend calculation
        const recentData = data.slice(-3);
        const earlierData = data.slice(0, 3);
        const recentAvg = recentData.reduce((sum, d) => sum + d.predicted, 0) / recentData.length;
        const earlierAvg = earlierData.reduce((sum, d) => sum + d.predicted, 0) / earlierData.length;
        const trend = recentAvg > earlierAvg * 1.1 ? 'up' : recentAvg < earlierAvg * 0.9 ? 'down' : 'stable';

        return { maxValue, minConfidence, avgPredicted, trend };
    }, [data]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="cc-panel">
            <div className="cc-panel-header">
                <div className="cc-panel-title">
                    <Brain size={16} />
                    {title}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderRadius: '9999px',
                    color: '#a78bfa',
                    fontSize: '0.6875rem',
                    fontWeight: 600
                }}>
                    AI Powered
                </div>
            </div>
            <div className="cc-panel-body">
                {/* Summary Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'var(--cc-accent-purple, #8b5cf6)'
                        }}>
                            {bloodType}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--cc-text-muted, #64748b)' }}>
                            Blood Type
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: chartData.trend === 'up' ? '#ef4444' : chartData.trend === 'down' ? '#22c55e' : '#64748b'
                        }}>
                            {chartData.trend === 'up' && <TrendingUp size={20} />}
                            {chartData.trend === 'down' && <TrendingDown size={20} />}
                            {chartData.trend === 'stable' && <Minus size={20} />}
                            {Math.round(chartData.avgPredicted)}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--cc-text-muted, #64748b)' }}>
                            Avg. Daily Units
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: chartData.minConfidence > 80 ? '#22c55e' : '#f59e0b'
                        }}>
                            {chartData.minConfidence}%
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--cc-text-muted, #64748b)' }}>
                            Min Confidence
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div style={{ position: 'relative', height: 180 }}>
                    {/* Y-axis labels */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 20,
                        width: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        fontSize: '0.625rem',
                        color: 'var(--cc-text-muted, #64748b)'
                    }}>
                        <span>{chartData.maxValue}</span>
                        <span>{Math.round(chartData.maxValue / 2)}</span>
                        <span>0</span>
                    </div>

                    {/* Chart Area */}
                    <div style={{
                        marginLeft: 35,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 4,
                        paddingBottom: 20
                    }}>
                        {data.map((item, index) => {
                            const isToday = item.date === today;
                            const isFuture = item.date > today;
                            const barHeight = (item.predicted / chartData.maxValue) * 140;
                            const actualHeight = item.actual ? (item.actual / chartData.maxValue) * 140 : 0;

                            return (
                                <div
                                    key={item.date}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                >
                                    {/* Bars */}
                                    <div style={{
                                        width: '100%',
                                        height: 140,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        gap: 2,
                                        position: 'relative'
                                    }}>
                                        {/* Confidence band (for future) */}
                                        {isFuture && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                width: '80%',
                                                height: barHeight,
                                                background: `linear-gradient(to top, rgba(139, 92, 246, ${item.confidence / 200}), transparent)`,
                                                borderRadius: 4
                                            }} />
                                        )}

                                        {/* Actual bar (past) */}
                                        {item.actual !== undefined && (
                                            <div style={{
                                                width: '35%',
                                                height: actualHeight,
                                                background: 'linear-gradient(to top, #22c55e, #16a34a)',
                                                borderRadius: '4px 4px 0 0',
                                                boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
                                            }} />
                                        )}

                                        {/* Predicted bar */}
                                        <div style={{
                                            width: item.actual !== undefined ? '35%' : '60%',
                                            height: barHeight,
                                            background: isFuture
                                                ? 'linear-gradient(to top, rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 0.4))'
                                                : 'linear-gradient(to top, #8b5cf6, #7c3aed)',
                                            borderRadius: '4px 4px 0 0',
                                            border: isToday ? '2px solid #fff' : 'none',
                                            boxShadow: isToday ? '0 0 15px rgba(255, 255, 255, 0.3)' : 'none',
                                            opacity: isFuture ? 0.7 : 1
                                        }} />
                                    </div>

                                    {/* Date label */}
                                    <div style={{
                                        fontSize: '0.5625rem',
                                        color: isToday ? '#fff' : 'var(--cc-text-muted, #64748b)',
                                        fontWeight: isToday ? 700 : 400,
                                        textAlign: 'center'
                                    }}>
                                        {new Date(item.date).toLocaleDateString('en', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--cc-border, #334155)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e' }} />
                        <span style={{ color: 'var(--cc-text-muted, #64748b)' }}>Actual</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: '#8b5cf6' }} />
                        <span style={{ color: 'var(--cc-text-muted, #64748b)' }}>Predicted</span>
                    </div>
                </div>

                {/* Alert if spike predicted */}
                {chartData.trend === 'up' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8
                    }}>
                        <AlertCircle size={18} color="#ef4444" />
                        <div style={{ fontSize: '0.8125rem' }}>
                            <strong style={{ color: '#ef4444' }}>Demand Spike Predicted</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted, #64748b)' }}>
                                Consider increasing inventory for {bloodType}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIPredictionChart;
