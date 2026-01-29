import { useState } from 'react';

export function AddBatchForm({ onSubmit, loading }) {
    const [formData, setFormData] = useState({
        blood_type: 'A+',
        units: 1,
        expiry_date: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        // Reset form slightly but keep useful defaults
        setFormData(prev => ({ ...prev, units: 1 }));
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="add-batch-form">
            <h3 className="mb-4">Add New Stock Batch</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select
                        name="blood_type"
                        className="form-select"
                        value={formData.blood_type}
                        onChange={handleChange}
                    >
                        {bloodTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Units</label>
                    <input
                        type="number"
                        name="units"
                        className="form-input"
                        min="1"
                        value={formData.units}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                        type="date"
                        name="expiry_date"
                        className="form-input"
                        min={minDate}
                        value={formData.expiry_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Stock'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export function InventoryTable({ batches, onDelete }) {
    if (!batches.length) {
        return <div className="text-center text-gray-400 py-8">No inventory batches found.</div>;
    }

    const getStatus = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Expired', class: 'expired-row', color: 'text-red-500' };
        if (diffDays <= 7) return { label: `Expiring in ${diffDays} days`, class: 'expiry-alert-row', color: 'text-yellow-500' };
        return { label: 'Good', class: '', color: 'text-green-500' };
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                        <th className="p-3">Batch ID</th>
                        <th className="p-3">Blood Type</th>
                        <th className="p-3">Units</th>
                        <th className="p-3">Entry Date</th>
                        <th className="p-3">Expiry Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map(batch => {
                        const status = getStatus(batch.expiry_date);
                        return (
                            <tr key={batch.id} className={`border-b border-gray-800 ${status.class} hover:bg-white/5`}>
                                <td className="p-3 text-sm text-gray-500">#{batch.id}</td>
                                <td className="p-3 font-bold text-lg">{batch.blood_type}</td>
                                <td className="p-3">{batch.units}</td>
                                <td className="p-3 text-sm text-gray-400">{new Date(batch.created_at).toLocaleDateString()}</td>
                                <td className="p-3">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                <td className={`p-3 font-medium ${status.color}`}>{status.label}</td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => onDelete(batch.id)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function LowStockAlerts({ batches }) {
    // Calculate total summary per type
    const summary = {};
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    bloodTypes.forEach(t => summary[t] = 0);

    batches.forEach(b => {
        // Only count non-expired
        if (new Date(b.expiry_date) > new Date()) {
            summary[b.blood_type] += b.units;
        }
    });

    const lowStock = Object.entries(summary).filter(([type, count]) => count < 5);

    if (lowStock.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-xl mb-3 text-red-500">⚠ Low Stock Alerts</h3>
            <div className="alerts-grid">
                {lowStock.map(([type, count]) => (
                    <div key={type} className="alert-card danger">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">{type}</span>
                            <span className="text-3xl font-extrabold">{count}</span>
                        </div>
                        <p className="text-sm opacity-80 mt-1">Units Available (Below threshold of 5)</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
