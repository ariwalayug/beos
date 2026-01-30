import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Bell, History } from 'lucide-react';
import { UrgencyBadge } from './UrgencyBadge';

interface VoiceAlertProps {
    enabled?: boolean;
    onAlertPlayed?: (alert: AlertItem) => void;
}

interface AlertItem {
    id: string;
    message: string;
    urgency: 'critical' | 'urgent' | 'normal';
    bloodType: string;
    hospital?: string;
    timestamp: Date;
    played: boolean;
}

// Voice alert messages for different urgency levels
const ALERT_MESSAGES = {
    critical: (bloodType: string, hospital: string) =>
        `Critical blood request. ${bloodType.replace('+', ' positive').replace('-', ' negative')} needed immediately. ${hospital || 'Check dashboard for details'}.`,
    urgent: (bloodType: string, hospital: string) =>
        `Urgent request. ${bloodType} blood needed at ${hospital || 'nearby hospital'}.`,
    normal: (bloodType: string) =>
        `New blood request for ${bloodType}.`
};

export function VoiceAlertSystem({ enabled = true, onAlertPlayed }: VoiceAlertProps) {
    const [isMuted, setIsMuted] = useState(!enabled);
    const [alertHistory, setAlertHistory] = useState<AlertItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthesisRef.current = window.speechSynthesis;
        } else {
            setIsSupported(false);
        }
    }, []);

    const speak = useCallback((text: string, urgency: 'critical' | 'urgent' | 'normal') => {
        if (!synthesisRef.current || isMuted) return;

        // Cancel any ongoing speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure voice based on urgency
        utterance.rate = urgency === 'critical' ? 1.1 : 1.0;
        utterance.pitch = urgency === 'critical' ? 1.2 : 1.0;
        utterance.volume = 1.0;

        // Try to use a clear, authoritative voice
        const voices = synthesisRef.current.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        synthesisRef.current.speak(utterance);
    }, [isMuted]);

    // Public method to trigger alert (call from parent)
    const triggerAlert = useCallback((
        bloodType: string,
        urgency: 'critical' | 'urgent' | 'normal',
        hospital?: string
    ) => {
        const message = ALERT_MESSAGES[urgency](bloodType, hospital || '');

        const alert: AlertItem = {
            id: Date.now().toString(),
            message,
            urgency,
            bloodType,
            hospital,
            timestamp: new Date(),
            played: !isMuted
        };

        setAlertHistory(prev => [alert, ...prev].slice(0, 50)); // Keep last 50

        if (!isMuted && urgency === 'critical') {
            // Play audio tone before voice for critical alerts
            playAlertTone();
            setTimeout(() => speak(message, urgency), 500);
        } else if (!isMuted) {
            speak(message, urgency);
        }

        onAlertPlayed?.(alert);
    }, [isMuted, speak, onAlertPlayed]);

    // Play attention-grabbing tone
    const playAlertTone = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
            oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } catch (e) {
            console.log('Audio tone not supported');
        }
    };

    // Expose triggerAlert to parent via ref or context
    useEffect(() => {
        (window as any).beosVoiceAlert = triggerAlert;
        return () => {
            delete (window as any).beosVoiceAlert;
        };
    }, [triggerAlert]);

    if (!isSupported) {
        return (
            <div className="cc-mute-toggle" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <VolumeX size={16} />
                <span>Voice Not Supported</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
                className={`cc-mute-toggle ${isMuted ? 'muted' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute Alerts' : 'Mute Alerts'}
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isMuted ? 'MUTED' : 'VOICE ON'}</span>
            </button>

            <button
                className="cc-mute-toggle"
                onClick={() => setShowHistory(!showHistory)}
                style={{ position: 'relative' }}
            >
                <History size={16} />
                {alertHistory.length > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '0.625rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {alertHistory.length}
                    </span>
                )}
            </button>

            {/* Alert History Panel */}
            {showHistory && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: 320,
                    maxHeight: 400,
                    backgroundColor: 'var(--cc-bg-card)',
                    border: '1px solid var(--cc-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    zIndex: 1000,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--cc-border)',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        <Bell size={14} style={{ display: 'inline', marginRight: 8 }} />
                        Alert History
                    </div>
                    <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                        {alertHistory.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cc-text-muted)' }}>
                                No alerts yet
                            </div>
                        ) : (
                            alertHistory.map(alert => (
                                <div
                                    key={alert.id}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid var(--cc-border)',
                                        borderLeft: `3px solid ${alert.urgency === 'critical' ? '#ef4444' :
                                                alert.urgency === 'urgent' ? '#f59e0b' : '#22c55e'
                                            }`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <UrgencyBadge level={alert.urgency} size="sm" showIcon={false} />
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--cc-text-muted)' }}>
                                            {alert.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem' }}>
                                        <strong>{alert.bloodType}</strong>
                                        {alert.hospital && ` — ${alert.hospital}`}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VoiceAlertSystem;
