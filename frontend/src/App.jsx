import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/Header';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
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
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
    return (
        <Router>
            <ToastProvider>
                <SocketProvider>
                    <AuthProvider>
                        <div className="app">
                            <Header />
                            <main className="main-content">
                                <ErrorBoundary>
                                    <Suspense fallback={
                                        <div className="flex h-screen items-center justify-center">
                                            <div className="spinner"></div>
                                        </div>
                                    }>
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/register" element={<Register />} />

                                            <Route path="/donors" element={<Donors />} />
                                            <Route path="/hospitals" element={<Hospitals />} />
                                            <Route path="/blood-banks" element={<BloodBanks />} />
                                            <Route path="/emergency" element={<Emergency />} />
                                            <Route path="/map" element={<EmergencyMap />} />

                                            <Route
                                                path="/donor-dashboard"
                                                element={
                                                    <ProtectedRoute roles={['user']}>
                                                        <DonorDashboard />
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path="/hospital-dashboard"
                                                element={
                                                    <ProtectedRoute roles={['hospital']}>
                                                        <HospitalDashboard />
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path="/blood-bank-dashboard"
                                                element={
                                                    <ProtectedRoute roles={['blood_bank']}>
                                                        <BloodBankDashboard />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/admin-dashboard"
                                                element={
                                                    <ProtectedRoute roles={['admin']}>
                                                        <AdminDashboard />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </Suspense>
                                </ErrorBoundary>
                            </main>
                            <Footer />
                        </div>
                    </AuthProvider>
                </SocketProvider>
            </ToastProvider>
        </Router>
    );
}

export default App;
