import { useState, useEffect } from 'react';
import { getHospitals } from '../services/api';
import { Building2, MapPin, Phone, Search, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import { motion } from 'framer-motion';
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
        <PageTransition className="hospitals-page professional">
            <div className="container section">
                <FadeIn className="page-header-pro">
                    <div className="header-badge">
                        <Building2 size={16} />
                        <span>Partner Network</span>
                    </div>
                    <h1>Partner Hospitals</h1>
                    <p>Medical centers equipped for blood emergencies.</p>
                </FadeIn>

                <div className="search-bar-pro">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search hospitals by name or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="results-container">
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-card-pro"></div>)}
                        </div>
                    ) : filteredHospitals.length === 0 ? (
                        <div className="empty-state-pro">
                            <Building2 size={48} className="text-muted" />
                            <h3>No hospitals found</h3>
                        </div>
                    ) : (
                        <div className="hospitals-grid-pro">
                            {filteredHospitals.map((hospital, i) => (
                                <motion.div
                                    key={hospital.id}
                                    className="hospital-card-pro"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <div className="card-header">
                                        <div className="hospital-icon-box">
                                            <Building2 size={24} />
                                        </div>
                                        <span className="status-badge success">Active</span>
                                    </div>

                                    <div className="card-body">
                                        <h3>{hospital.name}</h3>
                                        <div className="info-row">
                                            <MapPin size={16} className="text-muted" />
                                            <span>{hospital.city}</span>
                                        </div>
                                        <p className="address">{hospital.address}</p>
                                    </div>

                                    <div className="card-actions">
                                        <a href={`tel:${hospital.phone}`} className="btn btn-secondary btn-sm">
                                            <Phone size={16} /> Call
                                        </a>
                                        {hospital.emergency_contact && (
                                            <a href={`tel:${hospital.emergency_contact}`} className="btn btn-danger-outline btn-sm">
                                                <AlertTriangle size={16} /> Emergency
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

export default Hospitals;
