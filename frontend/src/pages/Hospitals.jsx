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
        <div className="hospitals-page">
            <div className="container">
                <header className="page-header">
                    <h1>Partner Hospitals</h1>
                    <p>Find hospitals partnered with our blood emergency network</p>
                </header>

                <div className="search-bar glass-card">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search hospitals by name or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading hospitals...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>Error: {error}</p>
                        <button className="btn btn-primary" onClick={fetchHospitals}>Retry</button>
                    </div>
                ) : filteredHospitals.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hospitals found</h3>
                        <p>Try a different search term</p>
                    </div>
                ) : (
                    <div className="hospitals-grid">
                        {filteredHospitals.map(hospital => (
                            <div key={hospital.id} className="hospital-card glass-card">
                                <div className="hospital-icon">🏥</div>
                                <div className="hospital-info">
                                    <h3>{hospital.name}</h3>
                                    <p className="hospital-address">{hospital.address}</p>
                                    <p className="hospital-city">📍 {hospital.city}</p>
                                </div>
                                <div className="hospital-contact">
                                    <a href={`tel:${hospital.phone}`} className="btn btn-primary btn-sm">
                                        📞 Call
                                    </a>
                                    {hospital.emergency_contact && (
                                        <a href={`tel:${hospital.emergency_contact}`} className="btn btn-danger btn-sm">
                                            🚨 Emergency
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Hospitals;
