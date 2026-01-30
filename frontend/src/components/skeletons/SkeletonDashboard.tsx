import { motion } from 'framer-motion';

const SkeletonDashboard = () => {
    return (
        <div className="home-professional overflow-hidden min-h-screen relative">
            <div className="absolute inset-0 bg-zinc-950 z-[-1]" />

            {/* Hero Section Skeleton */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col items-center text-center space-y-8">
                        {/* Status Badge */}
                        <div className="w-64 h-8 bg-zinc-800 rounded-full animate-pulse" />

                        {/* Headline */}
                        <div className="space-y-4 flex flex-col items-center w-full">
                            <div className="h-16 w-3/4 md:w-1/2 bg-zinc-800 rounded-lg animate-pulse" />
                            <div className="h-16 w-2/3 md:w-1/3 bg-zinc-800 rounded-lg animate-pulse" />
                        </div>

                        {/* Subtitle */}
                        <div className="h-6 w-full md:w-1/2 bg-zinc-800 rounded-lg animate-pulse" />

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
                            <div className="h-14 w-full sm:w-48 bg-zinc-800 rounded-xl animate-pulse" />
                            <div className="h-14 w-full sm:w-48 bg-zinc-800 rounded-xl animate-pulse" />
                            <div className="h-14 w-full sm:w-48 bg-zinc-800 rounded-xl animate-pulse" />
                        </div>

                        {/* Bulletin Board Skeleton */}
                        <div className="w-full max-w-4xl h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800 mt-12 animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Inventory Section Skeleton */}
            <section className="py-20 bg-zinc-900/30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="space-y-2">
                            <div className="w-48 h-8 bg-zinc-800 rounded animate-pulse" />
                            <div className="w-32 h-4 bg-zinc-800 rounded animate-pulse" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-full bg-zinc-900 border border-zinc-800 p-4 flex flex-col items-center justify-center animate-pulse">
                                <div className="w-16 h-16 rounded-full border-4 border-zinc-800" />
                                <div className="w-8 h-4 bg-zinc-800 mt-2 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SkeletonDashboard;
