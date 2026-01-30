import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GoogleMapProps {
    markers?: any[];
    center?: [number, number] | null;
    zoom?: number;
    showHeatmap?: boolean;
    userLocation?: { lat: number; lng: number } | null;
}

const GoogleMap = ({
    markers = [],
    center,
    zoom = 13,
    showHeatmap = false,
    userLocation
}: GoogleMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const clustererRef = useRef<MarkerClusterer | null>(null);
    const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
    const userMarkerRef = useRef<google.maps.Marker | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    // loadState: 'initializing' | 'loading' | 'ready' | 'error'
    const [loadState, setLoadState] = useState<'initializing' | 'loading' | 'ready' | 'error'>('initializing');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 1. Initialize Google Maps API
    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            console.error("❌ [GoogleMaps] API Key Missing!");
            setLoadState('error');
            setErrorMessage("Google Maps API Configuration Missing");
            return;
        }

        setLoadState('loading');

        const loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: "weekly",
            libraries: ["places", "visualization", "marker"] // Added marker library
        });

        loader.load().then(() => {
            console.log("✅ [GoogleMaps] Script Loaded");
            initMap();
        }).catch((e) => {
            console.error("❌ [GoogleMaps] Script Load Failed:", e);
            setLoadState('error');
            setErrorMessage("Failed to load map engine. Check connection.");
        });

    }, []);

    const initMap = useCallback(() => {
        if (!mapRef.current) return;

        try {
            console.log("🗺️ [GoogleMaps] Initializing Map Constructor");
            const map = new google.maps.Map(mapRef.current, {
                center: center ? { lat: center[0], lng: center[1] } : { lat: 21.1702, lng: 72.8311 },
                zoom: zoom,
                styles: [ // Dark mode style
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
                ],
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
            });

            mapInstanceRef.current = map;
            infoWindowRef.current = new google.maps.InfoWindow();

            setLoadState('ready');
        } catch (error: any) {
            console.error("❌ [GoogleMaps] Constructor Failed:", error);
            setLoadState('error');
            setErrorMessage(error.message || "Map Initialization Failed");
        }
    }, [center, zoom]);


    // 2. Handle Markers & Clustering
    useEffect(() => {
        if (loadState !== 'ready' || !mapInstanceRef.current) return;

        // Clear existing
        if (clustererRef.current) {
            clustererRef.current.clearMarkers();
        }
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // Create new markers
        const newMarkers = markers.map((m) => {
            const position = { lat: m.lat, lng: m.lng };

            // Icon customization
            let iconUrl = '';
            // Basic customized markers using Google Charts API or generic URLs as placeholders
            // Ideally should use local SVG assets or AdvancedMarkerElement with HTML
            if (m.type === 'request') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            else if (m.type === 'hospital') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            else if (m.type === 'donor') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            else if (m.type === 'bloodBank') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
            else iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';

            const marker = new google.maps.Marker({
                position,
                title: m.title,
                icon: iconUrl,
            });

            marker.addListener('click', () => {
                const content = `
                    <div style="padding: 8px; color: #333;">
                        <h3 style="margin: 0 0 5px 0; font-weight: bold;">${m.title}</h3>
                        <p style="margin: 0 0 5px 0; font-size: 13px;">${m.info}</p>
                        ${m.phone ? `<div style="font-size: 12px; background: #eee; padding: 4px; border-radius: 4px;">📞 ${m.phone}</div>` : ''}
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" style="display: block; margin-top: 8px; color: #1a73e8; text-decoration: none; font-weight: 500;">
                            📍 Get Directions
                        </a>
                    </div>
                `;
                infoWindowRef.current?.setContent(content);
                infoWindowRef.current?.open(mapInstanceRef.current, marker);
            });

            return marker;
        });

        markersRef.current = newMarkers;

        // Init Clusterer
        clustererRef.current = new MarkerClusterer({
            map: mapInstanceRef.current,
            markers: newMarkers
        });

    }, [markers, loadState]);

    // 3. Handle Heatmap
    useEffect(() => {
        if (loadState !== 'ready' || !mapInstanceRef.current) return;

        if (showHeatmap) {
            if (!heatmapRef.current) {
                const heatmapData = markers.map(m => new google.maps.LatLng(m.lat, m.lng));
                heatmapRef.current = new google.maps.visualization.HeatmapLayer({
                    data: heatmapData,
                    map: mapInstanceRef.current,
                    radius: 20
                });
            } else {
                heatmapRef.current.setMap(mapInstanceRef.current);
            }
        } else {
            heatmapRef.current?.setMap(null);
        }

    }, [showHeatmap, markers, loadState]);

    // 4. Handle User Location & Center Updates
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (center) {
            mapInstanceRef.current.panTo({ lat: center[0], lng: center[1] });
            mapInstanceRef.current.setZoom(zoom);
        }

        if (userLocation) {
            if (!userMarkerRef.current) {
                userMarkerRef.current = new google.maps.Marker({
                    position: { lat: userLocation.lat, lng: userLocation.lng },
                    map: mapInstanceRef.current,
                    title: "You are here",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                    },
                    zIndex: 999 // Always on top
                });
            } else {
                userMarkerRef.current.setPosition({ lat: userLocation.lat, lng: userLocation.lng });
            }
        }

    }, [center, zoom, userLocation, loadState]);


    // --- RENDER STATES ---

    if (loadState === 'error') {
        return (
            <div className="h-[500px] w-full flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="text-center p-6">
                    <span className="text-3xl mb-2 block">🗺️</span>
                    <h3 className="text-zinc-300 font-medium">Map Unavailable</h3>
                    <p className="text-zinc-500 text-sm mt-2">{errorMessage}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-zinc-800/50">
            {/* Map Container */}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {/* Loading Overlay */}
            {loadState === 'loading' && (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-zinc-500 text-sm">Connecting to Satellite...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleMap;
