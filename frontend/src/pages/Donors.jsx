import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDonors } from '../services/api';
import DonorCard from '../components/DonorCard';
import { Search, MapPin, Filter, X, Users, Droplet } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import { motion, AnimatePresence } from 'framer-motion';
import './Donors.css';

function Donors() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        blood_type: searchParams.get('blood_type') || '',
        city: searchParams.get('city') || '',
        available: searchParams.get('available') || ''
    });

    useEffect(() => {
        fetchDonors();
    }, [filters]);

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.blood_type) params.blood_type = filters.blood_type;
            if (filters.city) params.city = filters.city;
            if (filters.available) params.available = filters.available;

            const response = await getDonors(params);
            setDonors(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (value) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
        setSearchParams(searchParams);
    };

    const clearFilters = () => {
        setFilters({ blood_type: '', city: '', available: '' });
        setSearchParams({});
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const hasActiveFilters = filters.blood_type || filters.city || filters.available;

    return (
        <PageTransition className="donors-page professional">
            <div className="container section">
                <FadeIn className="page-header-pro">
                    <div className="header-badge">
                        <Users size={16} />
                        <span>Responders Directory</span>
                    </div>
                    <h1>Find Blood Donors</h1>
                    <p>Search the network of registered volunteers ready to respond.</p>
                </FadeIn>

                <div className="filters-panel">
                    <div className="filter-main">
                        <div className="search-input-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                            />
                        </div>

                        <div className="filter-divider"></div>

                        <div className="blood-filter-group">
                            <span className="filter-label">Blood Type:</span>
                            <div className="blood-chips-scroll">
                                <button
                                    className={`chip ${!filters.blood_type ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('blood_type', '')}
                                >
                                    All
                                </button>
                                {bloodTypes.map(type => (
                                    <button
                                        key={type}
                                        className={`chip ${filters.blood_type === type ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('blood_type', type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={filters.available === 'true'}
                                onChange={(e) => handleFilterChange('available', e.target.checked ? 'true' : '')}
                            />
                            <span className="slider"></span>
                            <span className="toggle-label">Available Only</span>
                        </label>

                        {hasActiveFilters && (
                            <button className="btn-clear" onClick={clearFilters}>
                                <X size={16} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="results-container">
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="skeleton-card-pro"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button onClick={fetchDonors}>Retry</button>
                        </div>
                    ) : donors.length === 0 ? (
                        <div className="empty-state-pro">
                            <div className="icon-circle"><Search size={32} /></div>
                            <h3>No donors found</h3>
                            <p>Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-meta">
                                <strong>{donors.length}</strong> volunteers found
                            </div>
                            <motion.div
                                className="donors-grid-pro"
                                layout
                            >
                                <AnimatePresence>
                                    {donors.map((donor, i) => (
                                        <motion.div
                                            key={donor.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.05 }}
                                            layout
                                        >
                                            <DonorCard
                                                donor={donor}
                                                onContact={(d) => window.open(`tel:${d.phone}`)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

export default Donors;
