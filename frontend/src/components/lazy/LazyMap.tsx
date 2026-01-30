import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the Google Maps component
const MapView = lazy(() => import('../GoogleMap'));

interface LazyMapProps {
    markers?: any[];
    showHeatmap?: boolean;
    userLocation?: { lat: number; lng: number } | null;
    center?: [number, number] | null;
    height?: string | number;
    zoom?: number;
}

const MapSkeleton = () => (
    <div className="w-full h-full min-h-[500px] bg-zinc-900/50 flex flex-col items-center justify-center rounded-lg border border-zinc-800 animate-pulse">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <span className="text-sm text-zinc-500">Loading Global Positioning...</span>
    </div>
);

const LazyMap = (props: LazyMapProps) => {
    return (
        <Suspense fallback={<MapSkeleton />}>
            <MapView {...props} />
        </Suspense>
    );
};

export default LazyMap;
