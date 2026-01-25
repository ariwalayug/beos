import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import L from 'leaflet';

// Client-side only wrapper
function MapView(props) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Leaflet setup inside useEffect to ensure window exists
        try {
            // Fix for default marker icons
            // Check if strict mode or SSR already handled this
            if (typeof window !== 'undefined' && !L.Icon.Default.prototype._getIconUrl_isFixed) {
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                L.Icon.Default.prototype._getIconUrl_isFixed = true;
            }
        } catch (e) {
            console.error("Leaflet Icon Fix Error", e);
        }
    }, []);

    if (!isMounted || typeof window === 'undefined') {
        return (
            <div className="h-[500px] w-full flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    <span className="text-sm text-zinc-500">Loading Map...</span>
                </div>
            </div>
        );
    }

    return <MapContent {...props} />;
}

// Internal component safely loaded only after mount
function MapContent({ markers, center, zoom = 13, showHeatmap = false, userLocation }) {
    const mapCenter = center || [21.1702, 72.8311];

    // Recreate icons every render or memoize, but L is guaranteed here
    const createCustomIcon = (type) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="marker-pulse ${type}"></div><div class="marker-pin ${type}"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -35]
        });
    };

    const icons = {
        donor: createCustomIcon('donor'),
        hospital: createCustomIcon('hospital'),
        bloodBank: createCustomIcon('bloodBank'),
        request: createCustomIcon('request'),
        user: createCustomIcon('user')
    };

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <ChangeView center={center} />
                {userLocation && <FlyToLocation center={[userLocation.lat, userLocation.lng]} />}

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {showHeatmap && markers.filter(m => m.type === 'request').map((marker, idx) => (
                    <Circle
                        key={`heat-${idx}`}
                        center={[marker.lat, marker.lng]}
                        radius={2000}
                        pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.3, color: 'transparent' }}
                    />
                ))}

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
                        <Popup><div className="text-sm"><strong>You are here</strong></div></Popup>
                    </Marker>
                )}

                {markers.map((marker, idx) => (
                    marker.lat && marker.lng && (
                        <Marker
                            key={idx}
                            position={[marker.lat, marker.lng]}
                            icon={icons[marker.type] || icons.hospital}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className={`w-2 h-full self-stretch rounded-l ${marker.type === 'request' ? 'bg-red-500' :
                                                marker.type === 'donor' ? 'bg-green-500' :
                                                    marker.type === 'bloodBank' ? 'bg-red-800' : 'bg-blue-500'
                                            }`}></div>
                                        <div>
                                            <strong className="block text-base">{marker.title}</strong>
                                            <span className="text-xs text-gray-500 uppercase font-semibold">{marker.type}</span>
                                        </div>
                                    </div>
                                    <hr className="my-2 border-gray-200" />
                                    <p className="m-0 text-gray-600 text-sm mb-2">{marker.info}</p>
                                    <div className="flex gap-2 mt-2">
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">📍 Get Directions</a>
                                        {marker.phone && <a href={`tel:${marker.phone}`} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors">📞 Call</a>}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function FlyToLocation({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

export default MapView;
