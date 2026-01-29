import { useState, useEffect } from 'react';
import { getHospitals } from '../services/api';
import hospitalsData from '../data/hospitals.json'; // Seed data
import { Building2, MapPin, Phone, Search, AlertTriangle, Navigation, Map } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import { motion } from 'framer-motion';
import './Hospitals.css';

function Hospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            // 1. Fetch from API
            const response = await getHospitals().catch(() => ({ data: [] }));
            const apiData = response.data || [];

            // 2. Merge with Seed Data (avoid duplicates by name)
            const seedData = hospitalsData;
            const existingNames = new Set(apiData.map(h => h.name.toLowerCase()));

            const uniqueSeedData = seedData.filter(h => !existingNames.has(h.name.toLowerCase()));

            const allHospitals = [...apiData, ...uniqueSeedData];

            setHospitals(allHospitals);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            // Fallback to seed only if everything fails
            setHospitals(hospitalsData);
        } finally {
            setLoading(false);
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                // Sort hospitals by distance
                const sorted = [...hospitals].sort((a, b) => {
                    const distA = getDistance(latitude, longitude, a.latitude, a.longitude);
                    const distB = getDistance(latitude, longitude, b.latitude, b.longitude);
                    return distA - distB;
                });
                setHospitals(sorted);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                alert('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    // Haversine formula to calculate distance in km
    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const deg2rad = (deg) => deg * (Math.PI / 180);

    // Extract unique cities
    const cities = [...new Set(hospitals.map(h => h.city))].sort();

    const filteredHospitals = hospitals.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.city.toLowerCase().includes(search.toLowerCase());
        const matchesCity = selectedCity ? h.city === selectedCity : true;
        return matchesSearch && matchesCity;
    });

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

                <div className="search-controls-container glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="search-bar-pro flex-grow">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search hospitals..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="city-select form-select bg-gray-800 text-white border-gray-700 rounded-lg p-3"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>

                    <button className="btn btn-primary" onClick={handleLocateMe}>
                        <Navigation size={18} /> Near Me
                    </button>
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
                                        <span className={`status-badge ${hospital.blood_bank_available ? 'success' : 'warning'}`}>
                                            {hospital.blood_bank_available ? 'Blood Bank' : 'Hospital'}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <h3>{hospital.name}</h3>
                                        <div className="info-row">
                                            <MapPin size={16} className="text-muted" />
                                            <span>{hospital.city}</span>
                                            {userLocation && hospital.latitude && (
                                                <span className="text-xs text-green-400 ml-2">
                                                    ({getDistance(userLocation.latitude, userLocation.longitude, hospital.latitude, hospital.longitude).toFixed(1)} km)
                                                </span>
                                            )}
                                        </div>
                                        <p className="address">{hospital.address}</p>
                                    </div>

                                    <div className="card-actions">
                                        <a href={`tel:${hospital.contact_phone}`} className="btn btn-secondary btn-sm">
                                            <Phone size={16} /> Call
                                        </a>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                                            <Map size={16} /> Map
                                        </a>
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
