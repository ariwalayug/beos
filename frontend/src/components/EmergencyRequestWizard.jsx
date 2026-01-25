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
    Phone,
    User,
    Stethoscope,
    Activity,
    ShieldAlert,
    Thermometer,
    Droplet
} from 'lucide-react';
import hospitalsData from '../data/hospitals.json';
import './EmergencyRequestWizard.css';

const STEPS = [
    { id: 1, label: 'Patient', icon: User },
    { id: 2, label: 'Blood', icon: Droplet },
    { id: 3, label: 'Clinical', icon: Activity },
    { id: 4, label: 'Safety', icon: ShieldAlert }
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];
const COMPONENT_TYPES = ['Whole Blood', 'Packed RBC', 'Platelets', 'Plasma'];
const REACTION_TYPES = ['Fever / Chills', 'Allergic Reaction', 'Hemolytic Reaction', 'Breathing Difficulty', 'Unknown'];

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

// Step 1: Patient & Medical Details
function StepPatient({ formData, setFormData, onNext, onDetectLocation, detectingLocation }) {
    const isValid = formData.patient_name && formData.age && formData.gender && formData.location;

    return (
        <motion.div
            className="wizard-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h3 className="step-title">Patient & Medical Details</h3>
            <p className="step-description">Who is the patient and where are they located?</p>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Patient Name</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Full Name (Optional)"
                        value={formData.patient_name}
                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Age</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Age"
                            min="0" max="120"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                            className="form-select"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="">Select</option>
                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Hospital / Location</label>
                    <div className="location-input-wrapper">
                        <MapPin size={18} className="location-icon" />
                        <input
                            type="text"
                            className="form-input location-input"
                            placeholder="Search hospital or city..."
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            list="hospital-suggestions"
                        />
                        <datalist id="hospital-suggestions">
                            {hospitalsData.map(h => (
                                <option key={h.id} value={`${h.name}, ${h.city}`} />
                            ))}
                        </datalist>
                        <button
                            type="button"
                            className="detect-location-btn"
                            onClick={onDetectLocation}
                            disabled={detectingLocation}
                        >
                            {detectingLocation ? <Loader2 size={16} className="spinning" /> : 'GPS'}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Attending Doctor / Dept (Optional)</label>
                    <div className="input-with-icon">
                        <Stethoscope size={18} className="input-icon" />
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Dr. Name or Department"
                            value={formData.doctor_name}
                            onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <button type="button" className="btn-next" onClick={onNext} disabled={!isValid}>
                Next Step <ArrowRight size={18} />
            </button>
        </motion.div>
    );
}

// Step 2: Blood Requirements
function StepBlood({ formData, setFormData, onNext, onBack }) {
    const isValid = formData.blood_type && formData.units > 0;

    return (
        <motion.div
            className="wizard-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h3 className="step-title">Blood Requirements</h3>
            <p className="step-description">What specifically is needed?</p>

            <div className="form-section">
                <label className="form-label">Blood Group</label>
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

            <div className="form-section">
                <label className="form-label">Component Type</label>
                <div className="component-selector">
                    {COMPONENT_TYPES.map(type => (
                        <button
                            key={type}
                            type="button"
                            className={`component-btn ${formData.component_type === type ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, component_type: type })}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Quantity Needed (Units)</label>
                <div className="units-control">
                    <button type="button" onClick={() => setFormData({ ...formData, units: Math.max(1, formData.units - 1) })}>-</button>
                    <span>{formData.units}</span>
                    <button type="button" onClick={() => setFormData({ ...formData, units: Math.min(20, formData.units + 1) })}>+</button>
                </div>
            </div>

            <div className="step-actions">
                <button type="button" className="btn-back" onClick={onBack}>Back</button>
                <button type="button" className="btn-next" onClick={onNext} disabled={!isValid}>
                    Clinical Vitals <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// Step 3: Clinical Parameters
function StepClinical({ formData, setFormData, onNext, onBack }) {
    return (
        <motion.div
            className="wizard-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h3 className="step-title">Clinical Parameters</h3>
            <p className="step-description">Enter vitals to help assess urgency.</p>

            <div className="form-grid">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Hemoglobin (g/dL)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="form-input"
                            placeholder="e.g. 10.5"
                            value={formData.hemoglobin}
                            onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
                        />
                        <span className="field-hint">Normal: 12.0 - 17.0</span>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Platelet Count</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="per µL"
                            value={formData.platelets}
                            onChange={(e) => setFormData({ ...formData, platelets: e.target.value })}
                        />
                        <span className="field-hint">Normal: 150k - 450k</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label flex justify-between">
                        Critical Condition?
                        <div className={`toggle-switch ${formData.is_critical ? 'active' : ''}`} onClick={() => setFormData({ ...formData, is_critical: !formData.is_critical })}>
                            <div className="toggle-handle" />
                        </div>
                    </label>
                    <p className="text-xs text-gray-400 mt-1">Patient requires immediate attention (within 1 hour).</p>
                </div>

                <div className="form-group">
                    <label className="form-label">Diagnosis / Reason</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Dengue, Accident Trauma..."
                        value={formData.diagnosis}
                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    />
                </div>
            </div>

            <div className="step-actions">
                <button type="button" className="btn-back" onClick={onBack}>Back</button>
                <button type="button" className="btn-next" onClick={onNext}>
                    Safety Info <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// Step 4: Reaction & Safety
function StepSafety({ formData, setFormData, onNext, onBack }) {
    const handleReactionToggle = (type) => {
        const reactions = formData.reaction_types ? formData.reaction_types.split(',') : [];
        if (reactions.includes(type)) {
            setFormData({ ...formData, reaction_types: reactions.filter(r => r !== type).join(',') });
        } else {
            setFormData({ ...formData, reaction_types: [...reactions, type].join(',') });
        }
    };

    return (
        <motion.div
            className="wizard-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h3 className="step-title">Safety & History</h3>
            <p className="step-description">Safety first. Any known risks?</p>

            <div className="form-group">
                <label className="form-label">History of Transfusion Reactions?</label>
                <div className="flex gap-4 mb-4">
                    <button onClick={() => setFormData({ ...formData, has_reaction_history: true })} className={`option-btn ${formData.has_reaction_history ? 'selected-danger' : ''}`}>Yes</button>
                    <button onClick={() => setFormData({ ...formData, has_reaction_history: false })} className={`option-btn ${!formData.has_reaction_history ? 'selected-safe' : ''}`}>No</button>
                </div>
            </div>

            {formData.has_reaction_history && (
                <div className="form-section animate-slide-in">
                    <label className="form-label">Reaction Types (Select all that apply)</label>
                    <div className="reaction-tags">
                        {REACTION_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                className={`reaction-tag ${(formData.reaction_types || '').includes(type) ? 'active' : ''}`}
                                onClick={() => handleReactionToggle(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Known Allergies</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="List any allergies..."
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Special Instructions</label>
                <textarea
                    className="form-input h-20"
                    placeholder="Notes for donors..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="step-actions">
                <button type="button" className="btn-back" onClick={onBack}>Back</button>
                <button type="button" className="btn-submit-emergency" onClick={onNext}>
                    Broadcast Emergency <Zap size={18} className="ml-2 fill-current" />
                </button>
            </div>
        </motion.div>
    );
}

// Processing Screen
function ProcessingScreen() {
    return (
        <motion.div className="wizard-step processing-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="processing-animation">
                <motion.div className="ripple-circle" animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                <AlertTriangle size={64} className="text-red-500 relative z-10" />
            </div>
            <h3>Broadcasting Agency</h3>
            <p>Matching with 45+ Hospitals & nearby donors...</p>
        </motion.div>
    );
}

// Step 5: Success (Summary)
function StepSuccess({ formData, onClose }) {
    return (
        <motion.div className="wizard-step step-success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="success-icon-wrapper">
                <Check size={48} />
            </div>
            <h3 className="step-title success">Emergency Broadcasted</h3>
            <p className="step-description">Donors have been alerted. Priority: <strong>{formData.is_critical ? 'CRITICAL' : 'High'}</strong></p>

            <div className="success-summary">
                <div className="summary-row">
                    <span>Patient:</span> <strong>{formData.patient_name} ({formData.age}{formData.gender ? `/${formData.gender.charAt(0)}` : ''})</strong>
                </div>
                <div className="summary-row">
                    <span>Blood:</span> <strong>{formData.units} Units {formData.blood_type} {formData.component_type}</strong>
                </div>
                <div className="summary-row">
                    <span>Location:</span> <strong>{formData.location}</strong>
                </div>
            </div>

            <button className="btn-success-close" onClick={onClose}>Track Status</button>
        </motion.div>
    );
}

export default function EmergencyRequestWizard({ onClose, onSubmit }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const [formData, setFormData] = useState({
        patient_name: '',
        age: '',
        gender: '',
        location: '',
        doctor_name: '',
        blood_type: '',
        component_type: 'Whole Blood',
        units: 1,
        hemoglobin: '',
        platelets: '',
        is_critical: false,
        diagnosis: '',
        has_reaction_history: false,
        reaction_types: '',
        allergies: '',
        notes: ''
    });

    const handleDetectLocation = () => {
        setDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({ ...prev, location: 'Current GPS Location Detected' }));
                    setDetectingLocation(false);
                },
                (error) => {
                    console.error(error);
                    setDetectingLocation(false);
                }
            );
        } else {
            setDetectingLocation(false);
        }
    };

    const handleFinalSubmit = () => {
        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            if (onSubmit) {
                // Combine reaction history into past_reaction field for backend compatibility
                const finalData = {
                    ...formData,
                    past_reaction: formData.has_reaction_history ? formData.reaction_types : 'None',
                    urgency: formData.is_critical ? 'critical' : 'urgent'
                };
                onSubmit(finalData);
            }
            setIsProcessing(false);
            setIsComplete(true);
        }, 2000);
    };

    return (
        <div className="wizard-overlay">
            <motion.div className="wizard-modal advanced-modal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <button className="wizard-close" onClick={onClose}>×</button>

                {!isComplete && !isProcessing && <ProgressSteps currentStep={currentStep} steps={STEPS} />}

                <div className="wizard-content">
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <ProcessingScreen key="processing" />
                        ) : isComplete ? (
                            <StepSuccess key="success" formData={formData} onClose={onClose} />
                        ) : (
                            <>
                                {currentStep === 1 && <StepPatient key="step1" formData={formData} setFormData={setFormData} onNext={() => setCurrentStep(2)} onDetectLocation={handleDetectLocation} detectingLocation={detectingLocation} />}
                                {currentStep === 2 && <StepBlood key="step2" formData={formData} setFormData={setFormData} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
                                {currentStep === 3 && <StepClinical key="step3" formData={formData} setFormData={setFormData} onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />}
                                {currentStep === 4 && <StepSafety key="step4" formData={formData} setFormData={setFormData} onNext={handleFinalSubmit} onBack={() => setCurrentStep(3)} />}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
