import { useState, useEffect, useRef } from 'react';
import { ApiResponse } from '../types';

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

const CACHE_duration = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<string, CacheItem<any>>();

interface UseDataOptions {
    revalidateOnFocus?: boolean;
    dedupingInterval?: number;
    initialData?: any;
}

export function useData<T>(
    key: string | null,
    fetcher: () => Promise<ApiResponse<T>>,
    options: UseDataOptions = {}
) {
    const [data, setData] = useState<T | null>(() => {
        // 1. Try memory cache first
        if (key && memoryCache.has(key)) {
            return memoryCache.get(key)!.data;
        }
        // 2. Try localStorage
        if (key) {
            try {
                const item = localStorage.getItem(`cache_${key}`);
                if (item) {
                    const parsed = JSON.parse(item);
                    // Check valid? (Optional: we can show stale data anyway)
                    return parsed.data;
                }
            } catch (e) {
                console.warn('Cache parse error', e);
            }
        }
        return options.initialData || null;
    });

    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(!data);
    const [isValidating, setIsValidating] = useState(false);

    // Prevent double-fetching in React 18 strict mode
    const fetchedRef = useRef<number>(0);

    const mutate = async () => {
        if (!key) return;
        setIsValidating(true);
        try {
            const response = await fetcher();
            const newData = response.data;

            setData(newData);

            // Update caches
            memoryCache.set(key, { data: newData, timestamp: Date.now() });
            localStorage.setItem(`cache_${key}`, JSON.stringify({
                data: newData,
                timestamp: Date.now()
            }));

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
            setIsValidating(false);
        }
    };

    useEffect(() => {
        if (!key) return;

        // If we have data, we're not technically "loading" (blocking), but we are validating
        if (data) setLoading(false);
        else setLoading(true);

        // Deduplication: Don't fetch if fetched efficiently recently (e.g. < 2s)
        const now = Date.now();
        if (now - fetchedRef.current < (options.dedupingInterval || 2000)) {
            return;
        }
        fetchedRef.current = now;

        mutate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return {
        data,
        loading,      // True only if no data AND first load
        isValidating, // True whenever a request is in flight
        error,
        mutate        // Function to force refresh
    };
}
