import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingAlerts from './components/FloatingAlerts';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Donors = lazy(() => import('./pages/Donors'));
const Hospitals = lazy(() => import('./pages/Hospitals'));
const BloodBanks = lazy(() => import('./pages/BloodBanks'));
const Emergency = lazy(() => import('./pages/Emergency'));
const EmergencyMap = lazy(() => import('./pages/EmergencyMap'));
const DonorDashboard = lazy(() => import('./pages/DonorDashboard'));
const HospitalDashboard = lazy(() => import('./pages/HospitalDashboard'));
const BloodBankDashboard = lazy(() => import('./pages/BloodBankDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminDonors = lazy(() => import('./pages/AdminDonors'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForHospitals = lazy(() => import('./pages/ForHospitals'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

function App() {
    const location = useLocation();

    return (
        <ToastProvider>
            <SocketProvider>
                <AuthProvider>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <ErrorBoundary>
                                <Suspense fallback={
                                    <div className="flex h-screen items-center justify-center bg-zinc-950">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                                    </div>
                                }>
                                    <AnimatePresence mode="wait">
                                        <Routes location={location} key={location.pathname}>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/register" element={<Register />} />

                                            <Route path="/donors" element={
                                                <ProtectedRoute roles={['admin']}>
                                                    <Donors />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/hospitals" element={<Hospitals />} />
                                            <Route path="/blood-banks" element={<BloodBanks />} />
                                            <Route path="/emergency" element={<Emergency />} />
                                            <Route path="/map" element={<EmergencyMap />} />

                                            <Route path="/donor-dashboard" element={<ProtectedRoute roles={['user', 'donor']}><DonorDashboard /></ProtectedRoute>} />
                                            <Route path="/hospital-dashboard" element={<ProtectedRoute roles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
                                            <Route path="/blood-bank-dashboard" element={<ProtectedRoute roles={['blood_bank']}><BloodBankDashboard /></ProtectedRoute>} />
                                            <Route path="/admin-dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                                            <Route path="/admin/donors" element={<ProtectedRoute roles={['admin']}><AdminDonors /></ProtectedRoute>} />
                                            <Route path="/for-hospitals" element={<ForHospitals />} />
                                            <Route path="/pricing" element={<Pricing />} />
                                            <Route path="/privacy" element={<PrivacyPolicy />} />
                                            <Route path="/terms" element={<TermsOfService />} />
                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </AnimatePresence>
                                </Suspense>
                            </ErrorBoundary>
                        </main>
                        <Footer />
                        <FloatingAlerts />
                    </div>
                </AuthProvider>
            </SocketProvider>
        </ToastProvider>
    );
}

export default App;
