import { motion } from 'framer-motion';
import { Gavel, AlertCircle, FileCheck, Users, Ban } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-zinc-950 pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 mb-6">
                        <Gavel className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Effective Date: January 2026
                    </p>
                </motion.div>

                <div className="space-y-8 text-zinc-300">
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <FileCheck className="w-6 h-6 text-blue-500" />
                            <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
                        </div>
                        <p className="text-zinc-400">
                            By accessing or using the BEOS (Blood Emergency Platform), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. BEOS is a connection service and does not provide direct medical care.
                        </p>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-blue-500" />
                            <h2 className="text-2xl font-semibold text-white">2. User Eligibility</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-zinc-400">
                            <li>You must be at least 18 years of age to register as a donor.</li>
                            <li>You must provide accurate and truthful medical information regarding your blood type and health status.</li>
                            <li>Hospitals and Blood Banks must be verified licensed medical institutions.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-blue-500" />
                            <h2 className="text-2xl font-semibold text-white">3. Medical Disclaimer</h2>
                        </div>
                        <p className="mb-4 text-zinc-400">
                            BEOS is a technology platform, not a healthcare provider. We do not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                            <li>Guarantee the availability of blood donors.</li>
                            <li>Verify the clinical safety of blood donated (this is the responsibility of the receiving medical facility).</li>
                            <li>Provide medical advice or diagnosis.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Ban className="w-6 h-6 text-blue-500" />
                            <h2 className="text-2xl font-semibold text-white">4. Prohibited Conduct</h2>
                        </div>
                        <p className="mb-4 text-zinc-400">
                            Users agree strictly NOT to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                            <li>Create false emergency requests.</li>
                            <li>Harass donors or medical staff.</li>
                            <li>Attempt to scrape data or reverse engineer the platform.</li>
                            <li>Use the platform for commercial solicitation of blood products (strictly illegal).</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Gavel className="w-6 h-6 text-blue-500" />
                            <h2 className="text-2xl font-semibold text-white">5. Limitation of Liability</h2>
                        </div>
                        <p className="text-zinc-400">
                            To the fullest extent permitted by law, BEOS and its developers shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the service, including but not limited to the failure to find a donor in a critical timeframe.
                        </p>
                    </section>
                </div>

                <div className="mt-12 text-center border-t border-zinc-800 pt-8">
                    <p className="text-zinc-500">
                        Questions about these terms? Contact <a href="mailto:legal@beos.platform" className="text-blue-500 hover:text-blue-400 transition-colors">legal@beos.platform</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
