import { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { getDonors, getHospitals, getBloodBanks, getRequests } from '../services/api';
import './EmergencyMap.css';

function EmergencyMap() {
    const [markers, setMarkers] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

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
                    title: `Latent Donor: ${d.name}`,
                    info: `Blood Type: ${d.blood_type}`,
                })),
                ...hospitalsRes.data.map(h => ({
                    lat: h.latitude,
                    lng: h.longitude,
                    type: 'hospital',
                    title: h.name,
                    info: `Hospital`,
                })),
                ...banksRes.data.map(b => ({
                    lat: b.latitude,
                    lng: b.longitude,
                    type: 'bloodBank',
                    title: b.name,
                    info: `Blood Bank`,
                })),
                ...requestsRes.data.map(r => ({
                    lat: r.hospital?.latitude || 21.1702, // Fallback if join issue
                    lng: r.hospital?.longitude || 72.8311,
                    type: 'request',
                    title: `Emergency: ${r.blood_type}`,
                    info: `Required at ${r.hospital_name || 'Unknown'}`,
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

                <div className="flex gap-2">
                    <button
                        className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveFilter('all')}
                    >All</button>
                    <button
                        className={`btn btn-sm ${activeFilter === 'request' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveFilter('request')}
                    >Emergencies</button>
                    <button
                        className={`btn btn-sm ${activeFilter === 'donor' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveFilter('donor')}
                    >Donors</button>
                    <button
                        className={`btn btn-sm ${activeFilter === 'hospital' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveFilter('hospital')}
                    >Hospitals</button>
                </div>
            </header>

            {loading ? (
                <div className="h-[500px] glass-card flex items-center justify-center">
                    <div className="spinner"></div>
                </div>
            ) : error ? (
                <div className="h-[500px] glass-card flex flex-col items-center justify-center">
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Failed to load map data</p>
                    <button className="btn btn-primary" onClick={fetchAllData}>Retry</button>
                </div>
            ) : (
                <div className="glass-card p-2">
                    <MapView markers={filteredMarkers} />
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
