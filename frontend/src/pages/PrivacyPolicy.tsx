import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Server } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-zinc-950 pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 mb-6">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Last Updated: January 2026
                    </p>
                </motion.div>

                <div className="space-y-8 text-zinc-300">
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
                        </div>
                        <p className="mb-4">
                            To facilitate rapid emergency blood response, BEOS collects the following data:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                            <li><strong>Personal Identification:</strong> Name, phone number, and email address.</li>
                            <li><strong>Medical Information:</strong> Blood type and donor eligibility status.</li>
                            <li><strong>Location Data:</strong> Real-time geolocation (only during active emergencies) to match donors with nearby hospitals.</li>
                            <li><strong>Device Information:</strong> Browser type and IP address for security purposes.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-semibold text-white">2. How We Use Your Data</h2>
                        </div>
                        <p className="mb-4">
                            Your data is used exclusively for saving lives and improving platform security:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                            <li><strong>Emergency Matching:</strong> Connecting you with nearby blood requests matching your blood type.</li>
                            <li><strong>Communication:</strong> Sending SMS or push notifications for urgent donation requests.</li>
                            <li><strong>Verification:</strong> ensuring the authenticity of donors and hospitals.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Server className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-semibold text-white">3. Data Storage & Security</h2>
                        </div>
                        <p className="text-zinc-400">
                            We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Your personal health information is effectively isolated and only shared with verified medical institutions when you explicitly accept a donation request.
                        </p>
                    </section>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-semibold text-white">4. Your Rights</h2>
                        </div>
                        <p className="mb-4">
                            You retain full control over your data:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                            <li><strong>Access & portability:</strong> Request a copy of your data at any time.</li>
                            <li><strong>Deletion:</strong> Request permanent deletion of your account and data.</li>
                            <li><strong>Opt-out:</strong> Disable location tracking or emergency alerts in your dashboard settings.</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-12 text-center border-t border-zinc-800 pt-8">
                    <p className="text-zinc-500">
                        For privacy concerns, contact our Data Protection Officer at <a href="mailto:privacy@beos.platform" className="text-red-500 hover:text-red-400 transition-colors">privacy@beos.platform</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
