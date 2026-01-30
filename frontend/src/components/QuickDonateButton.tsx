import React, { useState } from 'react';
import { Heart, MapPin, Phone, X, CheckCircle, Loader2 } from 'lucide-react';

interface QuickDonateButtonProps {
    userBloodType?: string;
    userName?: string;
    onDonate: (data: DonateFormData) => Promise<void>;
    requestId?: number;
    hospitalName?: string;
}

interface DonateFormData {
    bloodType: string;
    eta: string;
    notes?: string;
    shareLocation: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ETA_OPTIONS = ['15 mins', '30 mins', '1 hour', '2 hours'];

export function QuickDonateButton({
    userBloodType,
    userName,
    onDonate,
    requestId,
    hospitalName
}: QuickDonateButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'confirm' | 'details' | 'success'>('confirm');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<DonateFormData>({
        bloodType: userBloodType || '',
        eta: '30 mins',
        notes: '',
        shareLocation: false
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onDonate(formData);
            setStep('success');
            setTimeout(() => {
                setIsOpen(false);
                setStep('confirm');
            }, 3000);
        } catch (error) {
            console.error('Donate error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationConsent = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setFormData(prev => ({ ...prev, shareLocation: true })),
                () => setFormData(prev => ({ ...prev, shareLocation: false }))
            );
        }
    };

    return (
        <>
            {/* Floating Quick Donate Button */}
            <div className="cc-quick-donate">
                <button
                    className="cc-quick-donate-btn"
                    onClick={() => setIsOpen(true)}
                    aria-label="Quick Donate"
                >
                    <Heart size={24} fill="currentColor" />
                    I CAN DONATE
                </button>
            </div>

            {/* Full Screen Modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 480,
                        backgroundColor: 'var(--cc-bg-card, #18181b)',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid var(--cc-border, #334155)'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--cc-border, #334155)',
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Heart size={20} color="#ef4444" fill="#ef4444" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Quick Donate</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted, #64748b)' }}>
                                        {hospitalName || 'Respond to Emergency'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); setStep('confirm'); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--cc-text-muted, #64748b)',
                                    cursor: 'pointer',
                                    padding: 8
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            {step === 'confirm' && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '3rem',
                                        fontWeight: 900,
                                        color: '#ef4444',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {userBloodType || '?'}
                                    </div>
                                    <div style={{ marginBottom: '1.5rem', color: 'var(--cc-text-secondary, #94a3b8)' }}>
                                        {userName ? `${userName}, confirm your blood type` : 'Select your blood type'}
                                    </div>

                                    {!userBloodType && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gap: '0.5rem',
                                            marginBottom: '1.5rem'
                                        }}>
                                            {BLOOD_TYPES.map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: 8,
                                                        border: formData.bloodType === type
                                                            ? '2px solid #ef4444'
                                                            : '1px solid var(--cc-border, #334155)',
                                                        background: formData.bloodType === type
                                                            ? 'rgba(239, 68, 68, 0.1)'
                                                            : 'transparent',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setStep('details')}
                                        disabled={!formData.bloodType && !userBloodType}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 12,
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            opacity: (!formData.bloodType && !userBloodType) ? 0.5 : 1
                                        }}
                                    >
                                        YES, I CAN DONATE
                                    </button>
                                </div>
                            )}

                            {step === 'details' && (
                                <div>
                                    {/* ETA Selection */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: 'var(--cc-text-muted, #64748b)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Estimated Arrival Time
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {ETA_OPTIONS.map(eta => (
                                                <button
                                                    key={eta}
                                                    onClick={() => setFormData(prev => ({ ...prev, eta }))}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem 0.5rem',
                                                        borderRadius: 8,
                                                        border: formData.eta === eta
                                                            ? '2px solid #3b82f6'
                                                            : '1px solid var(--cc-border, #334155)',
                                                        background: formData.eta === eta
                                                            ? 'rgba(59, 130, 246, 0.1)'
                                                            : 'transparent',
                                                        color: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {eta}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location Consent */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(59, 130, 246, 0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: 8,
                                        marginBottom: '1.5rem'
                                    }}>
                                        <MapPin size={20} color="#3b82f6" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                Share Location
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted, #64748b)' }}>
                                                Help hospital track your arrival
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLocationConsent}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: 6,
                                                border: 'none',
                                                background: formData.shareLocation ? '#22c55e' : '#3b82f6',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {formData.shareLocation ? 'Shared ✓' : 'Allow'}
                                        </button>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 12,
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            cursor: loading ? 'wait' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {loading ? (
                                            <><Loader2 size={20} className="animate-spin" /> Confirming...</>
                                        ) : (
                                            <><Phone size={20} /> CONFIRM & NOTIFY HOSPITAL</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {step === 'success' && (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <CheckCircle size={40} color="#22c55e" />
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        You're a Hero! 🦸
                                    </div>
                                    <div style={{ color: 'var(--cc-text-secondary, #94a3b8)' }}>
                                        The hospital has been notified. They will contact you shortly.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default QuickDonateButton;
