/// <reference types="vite/client" />
import { useRef, useEffect, useState, useMemo } from 'react';
import Map, {
    Source,
    Layer,
    NavigationControl,
    GeolocateControl,
    FullscreenControl,
    ScaleControl,
    Popup,
    Marker,
    MapRef,
    useMap
} from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fix for Mapbox transpilation issues in some build setups
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
    markers?: any[];
    center?: [number, number] | null;
    zoom?: number;
    showHeatmap?: boolean;
    userLocation?: { lat: number; lng: number } | null;
}

const MapboxMap = ({
    markers = [],
    center,
    zoom = 13,
    showHeatmap = false,
    userLocation
}: MapboxMapProps) => {
    const mapRef = useRef<MapRef>(null);
    const [popupInfo, setPopupInfo] = useState<any>(null);

    // Initial View State
    const [viewState, setViewState] = useState({
        latitude: center ? center[0] : 21.1702,
        longitude: center ? center[1] : 72.8311,
        zoom: zoom
    });

    useEffect(() => {
        if (center) {
            mapRef.current?.flyTo({
                center: [center[1], center[0]],
                zoom: zoom,
                duration: 2000
            });
        }
    }, [center, zoom]);

    // Convert markers to GeoJSON for Clustering & Layers
    const pointsGeoJSON = useMemo(() => {
        return {
            type: 'FeatureCollection',
            features: markers.map((m, index) => ({
                type: 'Feature',
                properties: {
                    id: index,
                    type: m.type,
                    title: m.title,
                    info: m.info,
                    phone: m.phone,
                    lat: m.lat,
                    lng: m.lng,
                    icon: m.type === 'request' ? '🚨' :
                        m.type === 'hospital' ? '🏥' :
                            m.type === 'donor' ? '👤' :
                                m.type === 'bloodBank' ? '🩸' : '📍'
                },
                geometry: {
                    type: 'Point',
                    coordinates: [m.lng, m.lat]
                }
            }))
        };
    }, [markers]);

    // Heatmap Layer Configuration
    const heatmapLayer: any = {
        id: 'heatmap',
        maxzoom: 15,
        type: 'heatmap',
        paint: {
            'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                0, 0,
                6, 1
            ],
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                15, 3
            ],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 2,
                15, 20
            ],
            'heatmap-opacity': 0.8
        }
    };

    const [mapError, setMapError] = useState<string | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Robust Token Check
    const hasValidToken = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'undefined' && MAPBOX_TOKEN.startsWith('pk.');

    useEffect(() => {
        if (!hasValidToken) {
            console.warn("Mapbox Token is missing or invalid. Map will fall back to placeholder.");
        }
    }, [hasValidToken]);

    const handleRetry = () => {
        setMapError(null);
        setIsMapLoaded(false);
    };

    if (!hasValidToken || mapError) {
        return (
            <div className="h-[500px] w-full flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-transparent to-transparent"></div>
                <div className="text-center p-6 z-10">
                    <div className="bg-zinc-800/50 p-4 rounded-full inline-block mb-3 backdrop-blur-sm group-hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl grayscale opacity-70">🗺️</span>
                    </div>
                    <h3 className="text-zinc-300 font-medium mb-1">Map Temporarily Unavailable</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-4">
                        {mapError ? "Connection to map service interrupted." : "Visualization disabled. Data is still accessible below."}
                    </p>
                    {mapError && (
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                            <span className="text-xs">↻</span> Retry Connection
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onLoad={() => setIsMapLoaded(true)}
                onError={(e) => {
                    console.error("Mapbox Runtime Error:", e);
                    // Only treat as fatal if it hasn't loaded yet or is a critical error
                    if (!isMapLoaded) {
                        setMapError(e.error?.message || "Failed to load map");
                    }
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />
                <GeolocateControl position="top-right" />
                <FullscreenControl position="top-right" />
                <ScaleControl />

                {/* Data Source for Clusters & Points */}
                <Source
                    id="emergency-data"
                    type="geojson"
                    data={pointsGeoJSON as any}
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                    {/* Clustered Circles */}
                    <Layer
                        id="clusters"
                        type="circle"
                        filter={['has', 'point_count']}
                        paint={{
                            'circle-color': [
                                'step',
                                ['get', 'point_count'],
                                '#51bbd6', // Blue for low count
                                10,
                                '#f1f075', // Yellow for medium
                                30,
                                '#f28cb1' // Pink for high
                            ],
                            'circle-radius': [
                                'step',
                                ['get', 'point_count'],
                                20,
                                100,
                                30,
                                750,
                                40
                            ]
                        }}
                    />

                    {/* Cluster Count Text */}
                    <Layer
                        id="cluster-count"
                        type="symbol"
                        filter={['has', 'point_count']}
                        layout={{
                            'text-field': '{point_count_abbreviated}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12
                        }}
                    />

                    {/* Unclustered Points (Circles) */}
                    <Layer
                        id="unclustered-point"
                        type="circle"
                        filter={['!', ['has', 'point_count']]}
                        paint={{
                            'circle-color': [
                                'match',
                                ['get', 'type'],
                                'request', '#ef4444',
                                'hospital', '#3b82f6',
                                'donor', '#22c55e',
                                'bloodBank', '#a855f7',
                                '#aaa'
                            ],
                            'circle-radius': 12,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#fff'
                        }}
                    />

                    {/* Unclustered Points (Icons) */}
                    <Layer
                        id="unclustered-point-icon"
                        type="symbol"
                        filter={['!', ['has', 'point_count']]}
                        layout={{
                            'text-field': ['get', 'icon'],
                            'text-size': 14,
                            'text-allow-overlap': true
                        }}
                    />
                </Source>

                {/* Heatmap Layer (Conditional) */}
                {showHeatmap && (
                    <Source id="heatmap-source" type="geojson" data={pointsGeoJSON as any}>
                        <Layer {...heatmapLayer} />
                    </Source>
                )}

                {/* Interactive Click Handler for Popup */}
                {/* Note: In Mapbox, better to use click events on layers, but for simplicity we render transparent Markers or handle map Click */}

                {/* User Location Marker */}
                {userLocation && (
                    <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="bottom">
                        <div className="relative">
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                        </div>
                    </Marker>
                )}

                {/* Manual Markers for Popups upon Click (or handle via Layer onClick) */}
                {/* For this phase, sticking to Markers for Popups is easier for React integration, 
                    but pure Layers are more performant. Mixed approach: Layers for view, Markers for active interaction? 
                    Let's just use Markers for all if performance allows, BUT user asked for Clustering.
                    So we use Layers for clusters, and maybe Click handling for popups. */}

                <PopupClickHandlers
                    setPopupInfo={setPopupInfo}
                />

                {popupInfo && (
                    <Popup
                        anchor="top"
                        longitude={Number(popupInfo.lng)}
                        latitude={Number(popupInfo.lat)}
                        onClose={() => setPopupInfo(null)}
                    >
                        <div className="min-w-[200px] p-1 text-gray-900">
                            <div className="font-bold flex items-center gap-2 mb-1">
                                <span className={`w-3 h-3 rounded-full ${popupInfo.type === 'request' ? 'bg-red-500' :
                                    popupInfo.type === 'hospital' ? 'bg-blue-500' :
                                        popupInfo.type === 'donor' ? 'bg-green-500' : 'bg-purple-500'
                                    }`}></span>
                                {popupInfo.title}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{popupInfo.info}</div>
                            {popupInfo.phone && (
                                <div className="text-xs bg-gray-100 p-1 rounded text-center mb-1">
                                    📞 {popupInfo.phone}
                                </div>
                            )}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${popupInfo.lat},${popupInfo.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs bg-blue-50 text-blue-600 p-1 rounded text-center hover:bg-blue-100"
                            >
                                📍 Get Directions
                            </a>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
};

// Helper to handle clicks on the layer
function PopupClickHandlers({ setPopupInfo }: { setPopupInfo: any }) {
    const { current: map } = useMap();

    useEffect(() => {
        if (!map) return;

        const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
            // Check if clicked on a cluster
            const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            if (clusterFeatures.length > 0) {
                const clusterId = clusterFeatures[0].properties?.cluster_id;
                const source: any = map.getSource('emergency-data');

                source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
                    if (err) return;
                    map.easeTo({
                        center: (clusterFeatures[0].geometry as any).coordinates,
                        zoom,
                        duration: 500
                    });
                });
                return;
            }

            // Check if clicked on an unclustered point
            const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
            if (features.length > 0) {
                const feature = features[0];
                const properties = feature.properties;
                const geometry = feature.geometry as any;

                setPopupInfo({
                    ...properties,
                    lng: geometry.coordinates[0],
                    lat: geometry.coordinates[1]
                });
            }
        };

        map.on('click', ['clusters', 'unclustered-point'], onClick);

        // Cursors
        map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
        map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');

        return () => {
            map.off('click', ['clusters', 'unclustered-point'], onClick);
        };
    }, [map, setPopupInfo]);

    return null;
}

export default MapboxMap;
