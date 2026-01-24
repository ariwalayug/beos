import { useState, useEffect } from 'react';
import { getHospitals } from '../services/api';
import './Hospitals.css';

function Hospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const response = await getHospitals();
            setHospitals(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="hospitals-page masterpiece">
            {/* Background Effects */}
            <div className="page-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="container section">
                <header className="page-header animate-slide-up">
                    <div className="header-badge">
                        <span className="badge-icon">🏥</span>
                        <span>Emergency Network Partners</span>
                    </div>
                    <h1 className="page-title">
                        Partner
                        <span className="text-gradient-animated"> Hospitals</span>
                    </h1>
                    <p className="page-subtitle">
                        Trusted medical centers equipped for blood emergencies.
                    </p>
                </header>

                {/* Search Bar */}
                <div className="search-section glass-card animate-slide-up delay-1">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Find a hospital by name or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="clear-btn" onClick={() => setSearch('')}>×</button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="results-section animate-fade-in delay-2">
                    {loading ? (
                        <div className="loading-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton-card hospital-skeleton">
                                    <div className="skeleton-image"></div>
                                    <div className="skeleton-lines">
                                        <div className="skeleton-line long"></div>
                                        <div className="skeleton-line short"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="error-state glass-card">
                            <span className="error-icon">⚠️</span>
                            <h3>Unable to load hospitals</h3>
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={fetchHospitals}>Retry</button>
                        </div>
                    ) : filteredHospitals.length === 0 ? (
                        <div className="empty-state glass-card">
                            <span className="empty-icon">🏥</span>
                            <h3>No hospitals found</h3>
                            <p>We couldn't find any hospitals matching "{search}"</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-count">
                                Showing <strong>{filteredHospitals.length}</strong> partner hospital{filteredHospitals.length !== 1 ? 's' : ''}
                            </div>
                            <div className="hospitals-grid">
                                {filteredHospitals.map((hospital, index) => (
                                    <div
                                        key={hospital.id}
                                        className="hospital-card glass-card"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="hospital-card-header">
                                            <div className="hospital-icon-wrapper">
                                                <span className="hospital-icon">🏥</span>
                                            </div>
                                            <div className="hospital-status">
                                                <span className="status-dot online"></span>
                                                Active
                                            </div>
                                        </div>

                                        <div className="hospital-info">
                                            <h3>{hospital.name}</h3>
                                            <div className="info-row">
                                                <span className="info-icon">📍</span>
                                                <span className="info-text">{hospital.city}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-icon">🏢</span>
                                                <span className="info-text property-address">{hospital.address}</span>
                                            </div>
                                        </div>

                                        <div className="hospital-actions">
                                            <a href={`tel:${hospital.phone}`} className="btn-action primary">
                                                <span className="btn-icon">📞</span>
                                                Call Now
                                            </a>
                                            {hospital.emergency_contact && (
                                                <a href={`tel:${hospital.emergency_contact}`} className="btn-action emergency">
                                                    <span className="btn-icon">🚨</span>
                                                    Emergency
                                                </a>
                                            )}
                                        </div>
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

export default Hospitals;
