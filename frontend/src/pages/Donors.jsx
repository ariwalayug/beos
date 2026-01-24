import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDonors } from '../services/api';
import DonorCard from '../components/DonorCard';
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
        <div className="donors-page masterpiece">
            {/* Background Effects */}
            <div className="page-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <div className="container section">
                {/* Hero Header */}
                <header className="page-header animate-slide-up">
                    <div className="header-badge">
                        <span className="badge-icon">🦸</span>
                        <span>First Responder Network</span>
                    </div>
                    <h1 className="page-title">
                        Find Blood
                        <span className="text-gradient-animated"> Heroes</span>
                    </h1>
                    <p className="page-subtitle">
                        Connect with available donors in your area. Every hero counts.
                    </p>
                </header>

                {/* Advanced Filter Bar */}
                <div className="filters-section glass-card animate-slide-up delay-1">
                    <div className="filters-grid">
                        {/* Blood Type Pills */}
                        <div className="filter-group blood-type-filter">
                            <label className="filter-label">Blood Type</label>
                            <div className="blood-pills">
                                <button
                                    className={`blood-pill ${!filters.blood_type ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('blood_type', '')}
                                >
                                    All
                                </button>
                                {bloodTypes.map(type => (
                                    <button
                                        key={type}
                                        className={`blood-pill ${filters.blood_type === type ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('blood_type', type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location & Availability */}
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Location</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">📍</span>
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Search city..."
                                        value={filters.city}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Status</label>
                                <div className="status-pills">
                                    <button
                                        className={`status-pill ${!filters.available ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('available', '')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`status-pill available ${filters.available === 'true' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('available', 'true')}
                                    >
                                        <span className="status-dot"></span>
                                        Available
                                    </button>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button className="clear-filters-btn" onClick={clearFilters}>
                                    ✕ Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="results-section animate-fade-in delay-2">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-grid">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="skeleton-card">
                                        <div className="skeleton-avatar"></div>
                                        <div className="skeleton-lines">
                                            <div className="skeleton-line long"></div>
                                            <div className="skeleton-line short"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="error-state glass-card">
                            <span className="error-icon">⚠️</span>
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={fetchDonors}>
                                Try Again
                            </button>
                        </div>
                    ) : donors.length === 0 ? (
                        <div className="empty-state glass-card">
                            <span className="empty-icon">🔍</span>
                            <h3>No heroes found</h3>
                            <p>Try adjusting your filters or check back later</p>
                            {hasActiveFilters && (
                                <button className="btn btn-outline" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="results-header">
                                <div className="results-count">
                                    <span className="count-number">{donors.length}</span>
                                    <span className="count-label">Heroes Found</span>
                                </div>
                                {hasActiveFilters && (
                                    <div className="active-filters">
                                        {filters.blood_type && (
                                            <span className="filter-tag">
                                                🩸 {filters.blood_type}
                                                <button onClick={() => handleFilterChange('blood_type', '')}>×</button>
                                            </span>
                                        )}
                                        {filters.city && (
                                            <span className="filter-tag">
                                                📍 {filters.city}
                                                <button onClick={() => handleFilterChange('city', '')}>×</button>
                                            </span>
                                        )}
                                        {filters.available && (
                                            <span className="filter-tag">
                                                ✓ Available
                                                <button onClick={() => handleFilterChange('available', '')}>×</button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="donors-grid">
                                {donors.map((donor, index) => (
                                    <div
                                        key={donor.id}
                                        className="donor-card-wrapper"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <DonorCard
                                            donor={donor}
                                            onContact={(d) => window.open(`tel:${d.phone}`)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Donors;
