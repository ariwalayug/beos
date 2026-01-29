import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

function ThemeToggle({ className = '' }) {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        // Default to dark theme for blood emergency platform
        return true;
    });

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Also toggle a class for easier CSS targeting
        document.body.classList.toggle('light-mode', !isDark);
        document.body.classList.toggle('dark-mode', isDark);
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    return (
        <motion.button
            className={`theme-toggle ${className}`}
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <motion.div
                className="toggle-track"
                animate={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
            >
                <motion.div
                    className="toggle-thumb"
                    animate={{ x: isDark ? 0 : 24 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    {isDark ? (
                        <Moon size={14} className="theme-icon" />
                    ) : (
                        <Sun size={14} className="theme-icon" />
                    )}
                </motion.div>
            </motion.div>
        </motion.button>
    );
}

export default ThemeToggle;
