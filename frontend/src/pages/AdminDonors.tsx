import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonors } from '../services/api';
import { useToast } from '../context/ToastContext';
import './AdminDonors.css';

function AdminDonors() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            setLoading(true);
            const response = await getDonors();
            setDonors(response.data);
        } catch (err) {
            console.error(err);
            setError(err.message);
            showToast('Failed to load donors', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-donors-page">
            <div className="container section">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Manage Donors</h1>
                        <p className="text-gray-400">View and manage all registered donors</p>
                    </div>
                    <button onClick={() => navigate('/admin-dashboard')} className="btn btn-outline">
                        Back to Dashboard
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <div className="glass-card p-8 text-center">
                        <h3 className="text-xl text-red-500 mb-2">Error Loading Donors</h3>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <button onClick={fetchDonors} className="btn btn-primary">Retry</button>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-gray-700">
                                        <th className="p-4 font-semibold text-gray-300">ID</th>
                                        <th className="p-4 font-semibold text-gray-300">Name</th>
                                        <th className="p-4 font-semibold text-gray-300">Blood Group</th>
                                        <th className="p-4 font-semibold text-gray-300">Contact</th>
                                        <th className="p-4 font-semibold text-gray-300">Location</th>
                                        <th className="p-4 font-semibold text-gray-300">Status</th>
                                        <th className="p-4 font-semibold text-gray-300">Last Donation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donors.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-gray-500">
                                                No donors found.
                                            </td>
                                        </tr>
                                    ) : (
                                        donors.map(donor => (
                                            <tr key={donor.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-gray-400">#{donor.id}</td>
                                                <td className="p-4 font-medium text-white">{donor.name}</td>
                                                <td className="p-4">
                                                    <span className="badge badge-outline text-red-400 border-red-400">
                                                        {donor.blood_type}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">{donor.phone}</div>
                                                    {donor.email && <div className="text-xs text-gray-500">{donor.email}</div>}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">{donor.city}</div>
                                                    {donor.address && <div className="text-xs text-gray-500 truncate max-w-[150px]">{donor.address}</div>}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`badge ${donor.available ? 'badge-success' : 'badge-warning'}`}>
                                                        {donor.available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-400 text-sm">
                                                    {donor.last_donation ? new Date(donor.last_donation).toLocaleDateString() : 'Never'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDonors;
