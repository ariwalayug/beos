import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Zap,
    AlertTriangle,
    Info,
    Check,
    ArrowRight,
    Loader2,
    Heart,
    Building2,
    Phone
} from 'lucide-react';
import './EmergencyRequestWizard.css';

const STEPS = [
    { id: 1, label: 'Details', icon: Info },
    { id: 2, label: 'Match', icon: Zap },
    { id: 3, label: 'Notify', icon: AlertTriangle },
    { id: 4, label: 'Confirm', icon: Check }
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const URGENCY_LEVELS = [
    { value: 'normal', label: 'Normal', icon: Info, color: '#10b981', description: 'Within 24 hours' },
    { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: '#f59e0b', description: 'Within 6 hours' },
    { value: 'critical', label: 'Critical', icon: Zap, color: '#ef4444', description: 'Immediate need' }
];

// Progress Steps Component
function ProgressSteps({ currentStep, steps }) {
    return (
        <div className="progress-steps">
            {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                    <div key={step.id} className="progress-step-wrapper">
                        <div className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <div className="progress-step-circle">
                                {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
                            </div>
                            <span className="progress-step-label hide-mobile">{step.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`progress-connector ${isCompleted ? 'completed' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Step 1: Request Details
function StepDetails({ formData, setFormData, onNext, onDetectLocation, detectingLocation }) {
    const isValid = formData.blood_type && formData.units > 0 && formData.urgency;

    return (
        <motion.div
            className="wizard-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h3 className="step-title">Emergency Blood Request</h3>
            <p className="step-description">Fill in the critical details for immediate matching.</p>

            {/* Urgency Selection */}
            <div className="form-section">
                <label className="form-label">Urgency Level</label>
                <div className="urgency-selector">
                    {URGENCY_LEVELS.map(level => {
                        const Icon = level.icon;
                        return (
                            <button
                                key={level.value}
                                type="button"
                                className={`urgency-option ${formData.urgency === level.value ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, urgency: level.value })}
                                style={{ '--urgency-color': level.color }}
                            >
                                <Icon size={24} />
                                <span className="urgency-label">{level.label}</span>
                                <span className="urgency-desc">{level.description}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Blood Type */}
            <div className="form-section">
                <label className="form-label">Blood Type Required</label>
                <div className="blood-type-grid">
                    {BLOOD_TYPES.map(type => (
                        <button
                            key={type}
                            type="button"
                            className={`blood-type-btn ${formData.blood_type === type ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, blood_type: type })}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Units */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Units Needed</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-input"
                        value={formData.units}
                        onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Patient Name</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter patient name"
                        value={formData.patient_name}
                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    />
                </div>
            </div>

            {/* Location */}
            <div className="form-section">
                <label className="form-label">Location</label>
                <div className="location-input-wrapper">
                    <MapPin size={18} className="location-icon" />
                    <input
                        type="text"
                        className="form-input location-input"
                        placeholder="Hospital or city"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <button
                        type="button"
                        className="detect-location-btn"
                        onClick={onDetectLocation}
                        disabled={detectingLocation}
                    >
                        {detectingLocation ? <Loader2 size={16} className="spinning" /> : 'Auto-detect'}
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="btn-next"
                onClick={onNext}
                disabled={!isValid}
            >
                Find Matching Donors <ArrowRight size={18} />
            </button>
        </motion.div>
    );
}

// Step 2: Matching
function StepMatching({ formData, onNext }) {
    const [matchingProgress, setMatchingProgress] = useState(0);
    const [donorsFound, setDonorsFound] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMatchingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onNext, 500);
                    return 100;
                }
                return prev + 5;
            });
            setDonorsFound(prev => Math.min(prev + Math.floor(Math.random() * 3), 15));
        }, 100);

        return () => clearInterval(interval);
    }, [onNext]);

    return (
        <motion.div
            className="wizard-step step-matching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="matching-animation">
                <motion.div
                    className="matching-pulse"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="blood-type-display">{formData.blood_type}</div>
            </div>

            <h3 className="step-title">Finding Compatible Donors</h3>
            <p className="step-description">
                Searching for {formData.blood_type} donors near {formData.location || 'your area'}...
            </p>

            <div className="matching-progress">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${matchingProgress}%` }}
                    />
                </div>
                <span className="progress-text">{matchingProgress}%</span>
            </div>

            <div className="donors-found">
                <Heart size={20} className="pulse" />
                <span><strong>{donorsFound}</strong> compatible donors found</span>
            </div>
        </motion.div>
    );
}

// Step 3: Notifying
function StepNotifying({ formData, onNext }) {
    const [notifyProgress, setNotifyProgress] = useState(0);
    const [notified, setNotified] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setNotifyProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onNext, 500);
                    return 100;
                }
                return prev + 8;
            });
            setNotified(prev => Math.min(prev + 1, 12));
        }, 150);

        return () => clearInterval(interval);
    }, [onNext]);

    return (
        <motion.div
            className="wizard-step step-notifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="notify-animation">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <AlertTriangle size={48} className="notify-icon" />
                </motion.div>
            </div>

            <h3 className="step-title">Alerting Nearby Donors</h3>
            <p className="step-description">
                Sending emergency notifications to matched donors...
            </p>

            <div className="matching-progress">
                <div className="progress-bar notify">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${notifyProgress}%` }}
                    />
                </div>
                <span className="progress-text">{notified} notified</span>
            </div>
        </motion.div>
    );
}

// Step 4: Success
function StepSuccess({ formData, onClose }) {
    return (
        <motion.div
            className="wizard-step step-success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="success-icon-wrapper"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <Check size={48} />
            </motion.div>

            <h3 className="step-title success">Request Broadcasted!</h3>
            <p className="step-description">
                Your emergency request for <strong>{formData.blood_type}</strong> blood has been sent to
                <strong> 12 nearby donors</strong>. You'll receive responses shortly.
            </p>

            <div className="success-summary">
                <div className="summary-item">
                    <Building2 size={18} />
                    <span>{formData.location || 'Your Location'}</span>
                </div>
                <div className="summary-item">
                    <Heart size={18} />
                    <span>{formData.units} unit(s) of {formData.blood_type}</span>
                </div>
                <div className="summary-item">
                    <Phone size={18} />
                    <span>Donors will contact you directly</span>
                </div>
            </div>

            <div className="success-message">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    💪
                </motion.div>
                <p>Stay strong. Help is on the way!</p>
            </div>

            <button className="btn-success-close" onClick={onClose}>
                Done
            </button>
        </motion.div>
    );
}

// Main Wizard Component
export default function EmergencyRequestWizard({ onClose, onSubmit }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [formData, setFormData] = useState({
        blood_type: '',
        units: 1,
        urgency: 'urgent',
        patient_name: '',
        location: '',
        hospital_id: '',
        contact_phone: '',
        notes: ''
    });

    const handleDetectLocation = () => {
        setDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // In a real app, you'd reverse geocode this
                        setFormData(prev => ({
                            ...prev,
                            location: 'Current Location Detected'
                        }));
                    } catch (error) {
                        console.error('Location detection failed:', error);
                    } finally {
                        setDetectingLocation(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setDetectingLocation(false);
                }
            );
        } else {
            setDetectingLocation(false);
        }
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="wizard-overlay">
            <motion.div
                className="wizard-modal"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
            >
                <button className="wizard-close" onClick={onClose}>×</button>

                <ProgressSteps currentStep={currentStep} steps={STEPS} />

                <div className="wizard-content">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <StepDetails
                                key="step1"
                                formData={formData}
                                setFormData={setFormData}
                                onNext={() => setCurrentStep(2)}
                                onDetectLocation={handleDetectLocation}
                                detectingLocation={detectingLocation}
                            />
                        )}
                        {currentStep === 2 && (
                            <StepMatching
                                key="step2"
                                formData={formData}
                                onNext={() => {
                                    handleSubmit();
                                    setCurrentStep(3);
                                }}
                            />
                        )}
                        {currentStep === 3 && (
                            <StepNotifying
                                key="step3"
                                formData={formData}
                                onNext={() => setCurrentStep(4)}
                            />
                        )}
                        {currentStep === 4 && (
                            <StepSuccess
                                key="step4"
                                formData={formData}
                                onClose={onClose}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
