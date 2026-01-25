import React from 'react';
import './AvailableOnlyCheckbox.css';

/**
 * Available Only Checkbox Component
 * A compact inline filter control for blood donor search.
 * 
 * @param {boolean} checked - Current state of the checkbox
 * @param {function} onChange - Callback function when state changes
 * @param {string} className - Optional additional CSS class
 */
const AvailableOnlyCheckbox = ({ checked, onChange, className = '' }) => {
    return (
        <label className={`available-only-checkbox ${checked ? 'checked' : ''} ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="visually-hidden"
            />
            <span className={`checkbox-box ${checked ? 'checked' : ''}`}>
                {checked && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </span>
            <span className="checkbox-label">Available only</span>
        </label>
    );
};

export default AvailableOnlyCheckbox;
