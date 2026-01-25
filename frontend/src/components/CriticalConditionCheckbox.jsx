import React from 'react';
import './CriticalConditionCheckbox.css';

/**
 * Critical Condition Checkbox Component
 * A specialized medical UI component for toggling critical status.
 * 
 * @param {boolean} checked - Current state of the checkbox
 * @param {function} onChange - Callback function when state changes
 */
const CriticalConditionCheckbox = ({ checked, onChange }) => {
    return (
        <div
            className={`critical-checkbox-card ${checked ? 'checked' : ''}`}
            onClick={() => onChange(!checked)}
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
        >
            <div className={`custom-checkbox ${checked ? 'checked' : ''}`}>
                {checked && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>

            <div className="critical-content">
                <h3 className="critical-title">CRITICAL CONDITION?</h3>
                <p className="critical-subtitle">Patient requires immediate attention (within 1 hour).</p>
            </div>
        </div>
    );
};

export default CriticalConditionCheckbox;
