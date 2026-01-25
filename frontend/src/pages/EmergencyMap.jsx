import { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { getDonors, getHospitals, getBloodBanks, getRequests } from '../services/api';
import './EmergencyMap.css';

function EmergencyMap() {
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showHeatmap, setShowHeatmap] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleLocateUser = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(loc);
                    setMapCenter([loc.lat, loc.lng]); // Center map on user
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setError("Could not retrieve your location. Please check permissions.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    const fetchAllData = async () => {
        try {
            setError(null);
            const [donorsRes, hospitalsRes, banksRes, requestsRes] = await Promise.all([
                getDonors(),
                getHospitals(),
                getBloodBanks(),
                getRequests({ status: 'pending' })
            ]);

            const allMarkers = [
                ...donorsRes.data.map(d => ({
                    lat: d.latitude,
                    lng: d.longitude,
                    type: 'donor',
                    title: d.name,
                    info: `Blood Type: ${d.blood_type}`,
                    phone: d.phone
                })),
                ...hospitalsRes.data.map(h => ({
                    lat: h.latitude,
                    lng: h.longitude,
                    type: 'hospital',
                    title: h.name,
                    info: h.city,
                    phone: h.phone
                })),
                ...banksRes.data.map(b => ({
                    lat: b.latitude,
                    lng: b.longitude,
                    type: 'bloodBank',
                    title: b.name,
                    info: `Blood Bank - ${b.city}`,
                    phone: b.phone
                })),
                ...requestsRes.data.map(r => ({
                    lat: r.hospital?.latitude || 21.1702,
                    lng: r.hospital?.longitude || 72.8311,
                    type: 'request',
                    title: `URGENT: ${r.blood_type}`,
                    info: `Required at ${r.hospital_name || 'Unknown'}`,
                    contact: r.hospital?.phone
                }))
            ];

            setMarkers(allMarkers);
        } catch (error) {
            console.error("Failed to load map data", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredMarkers = activeFilter === 'all'
        ? markers
        : markers.filter(m => m.type === activeFilter);

    return (
        <div className="container section">
            <header className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Live Emergency Map</h1>
                    <p className="text-gray-400">Real-time view of donors, hospitals, and blood banks.</p>
                </div>

                <div className="flex gap-2 items-center flex-wrap controls-bar">
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleLocateUser}
                        title="Use My Location"
                    >
                        📍 My Location
                    </button>

                    <button
                        className={`btn btn-sm ${showHeatmap ? 'btn-danger' : 'btn-outline'}`}
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        title="Show high demand zones"
                    >
                        🔥 Heatmap
                    </button>

                    <div className="h-6 w-px bg-gray-700 mx-2 hidden md:block"></div>

                    <div className="flex bg-zinc-800 p-1 rounded-lg">
                        <button
                            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >All</button>
                        <button
                            className={`filter-tab ${activeFilter === 'request' ? 'active urgent' : ''}`}
                            onClick={() => setActiveFilter('request')}
                        >🚨 Emergencies</button>
                        <button
                            className={`filter-tab ${activeFilter === 'donor' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('donor')}
                        >👤 Donors</button>
                        <button
                            className={`filter-tab ${activeFilter === 'hospital' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('hospital')}
                        >🏥 Hospitals</button>
                        <button
                            className={`filter-tab ${activeFilter === 'bloodBank' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('bloodBank')}
                        >🩸 Banks</button>
                    </div>
                </div>
            </header>

            {loading && !markers.length ? (
                <div className="h-[500px] glass-card flex items-center justify-center">
                    <div className="spinner"></div>
                </div>
            ) : error ? (
                <div className="h-[500px] glass-card flex flex-col items-center justify-center">
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Failed to load map data</p>
                    <button className="btn btn-primary" onClick={fetchAllData}>Retry</button>
                </div>
            ) : (
                <div className="glass-card p-2 relative">
                    <MapView
                        markers={filteredMarkers}
                        showHeatmap={showHeatmap}
                        userLocation={userLocation}
                        center={mapCenter}
                    />

                    {/* Legend Overlay */}
                    <div className="map-legend">
                        <div className="legend-item"><span className="dot request"></span> Emergency</div>
                        <div className="legend-item"><span className="dot hospital"></span> Hospital</div>
                        <div className="legend-item"><span className="dot bloodBank"></span> Blood Bank</div>
                        <div className="legend-item"><span className="dot donor"></span> Donor</div>
                    </div>
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1">{markers.filter(m => m.type === 'donor').length}</div>
                    <div className="text-sm opacity-70">Active Donors</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-1">{markers.filter(m => m.type === 'request').length}</div>
                    <div className="text-sm opacity-70">Emergencies</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-1">{markers.filter(m => m.type === 'hospital').length}</div>
                    <div className="text-sm opacity-70">Hospitals</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-red-500 mb-1">{markers.filter(m => m.type === 'bloodBank').length}</div>
                    <div className="text-sm opacity-70">Blood Banks</div>
                </div>
            </div>
        </div>
    );
}

export default EmergencyMap;
