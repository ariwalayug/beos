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
const createPulsingIcon = (type) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pulse ${type}"></div><div class="marker-pin ${type}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -20]
    });
};

const icons = {
    donor: createPulsingIcon('donor'),
    hospital: createPulsingIcon('hospital'),
    bloodBank: createPulsingIcon('bloodBank'),
    request: createPulsingIcon('request'),
    user: createPulsingIcon('user')
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

function MapView({ markers, center = [21.1702, 72.8311], zoom = 13, showHeatmap = false }) { // Default to Surat
    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Heatmap Overlay (Simulated with Circles) */}
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

                {markers.map((marker, idx) => (
                    marker.lat && marker.lng && (
                        <Marker
                            key={idx}
                            position={[marker.lat, marker.lng]}
                            icon={icons[marker.type] || icons.donor}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong className="block text-base mb-1">{marker.title}</strong>
                                    <p className="m-0 text-gray-600">{marker.info}</p>
                                    {marker.link && (
                                        <a href={marker.link} className="text-blue-500 hover:underline block mt-1">
                                            View Details
                                        </a>
                                    )}
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
