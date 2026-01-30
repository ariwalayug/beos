import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy map component
// @ts-expect-error MapView might not have default export type definition yet
const MapView = lazy(() => import('../MapView'));

interface LazyMapProps {
    markers?: any[];
    showHeatmap?: boolean;
    userLocation?: { lat: number; lng: number } | null;
    center?: [number, number] | null;
    height?: string | number;
}

const MapSkeleton = () => (
    <div className="w-full h-full min-h-[400px] bg-zinc-900/50 flex flex-col items-center justify-center rounded-lg border border-zinc-800 animate-pulse">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <span className="text-sm text-zinc-500">Loading Map Engine...</span>
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
