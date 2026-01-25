import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons using DivIcon for CSS animations
const createCustomIcon = (type) => {
    // Icons (using simple geometric shapes or could be SVGs in CSS)
    // The CSS .marker-pin classes now handle the coloring
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

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

function FlyToLocation({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
}

function MapView({ markers, center, zoom = 13, showHeatmap = false, userLocation }) {
    // Default center if none provided (Surat)
    const mapCenter = center || [21.1702, 72.8311];

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                {/* Handle view changes logic */}
                <ChangeView center={center} />
                {userLocation && <FlyToLocation center={[userLocation.lat, userLocation.lng]} />}

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Heatmap Overlay (Simulated with Circles for emergencies) */}
                {showHeatmap && markers.filter(m => m.type === 'request').map((marker, idx) => (
                    <Circle
                        key={`heat-${idx}`}
                        center={[marker.lat, marker.lng]}
                        radius={2000} // 2km radius
                        pathOptions={{
                            fillColor: '#ef4444',
                            fillOpacity: 0.3,
                            color: 'transparent'
                        }}
                    />
                ))}

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={icons.user}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>You are here</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Entity Markers */}
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
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                        >
                                            📍 Get Directions
                                        </a>
                                        {marker.phone && (
                                            <a href={`tel:${marker.phone}`} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors">
                                                📞 Call
                                            </a>
                                        )}
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

export default MapView;
