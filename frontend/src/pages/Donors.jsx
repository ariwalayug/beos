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

    return (
        <div className="donors-page">
            <div className="container">
                <header className="page-header">
                    <h1>Find Blood Donors</h1>
                    <p>Search for available donors by blood type and location</p>
                </header>

                <div className="filters-bar glass-card">
                    <div className="filter-group">
                        <label className="form-label">Blood Type</label>
                        <select
                            className="form-select"
                            value={filters.blood_type}
                            onChange={(e) => handleFilterChange('blood_type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            {bloodTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter city..."
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="form-label">Availability</label>
                        <select
                            className="form-select"
                            value={filters.available}
                            onChange={(e) => handleFilterChange('available', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="true">Available Only</option>
                            <option value="false">Unavailable</option>
                        </select>
                    </div>

                    <button className="btn btn-secondary" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading donors...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>Error: {error}</p>
                        <button className="btn btn-primary" onClick={fetchDonors}>Retry</button>
                    </div>
                ) : donors.length === 0 ? (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h3>No donors found</h3>
                        <p>Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    <>
                        <div className="results-info">
                            <p>Found <strong>{donors.length}</strong> donor{donors.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="donors-grid">
                            {donors.map(donor => (
                                <DonorCard
                                    key={donor.id}
                                    donor={donor}
                                    onContact={(d) => window.open(`tel:${d.phone}`)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Donors;
