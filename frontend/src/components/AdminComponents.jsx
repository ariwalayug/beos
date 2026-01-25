import { useState } from 'react';

export function StatsCard({ title, value, color, icon }) {
    return (
        <div className={`glass-card p-4 border-l-4 border-${color}-500`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-sm uppercase font-bold tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
                </div>
                <div className={`text-${color}-500 text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export function UserTable({ users, onDelete }) {
    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-gray-700">
                            <th className="p-4 font-semibold text-gray-300">User ID</th>
                            <th className="p-4 font-semibold text-gray-300">Name/Email</th>
                            <th className="p-4 font-semibold text-gray-300">Role</th>
                            <th className="p-4 font-semibold text-gray-300">Joined</th>
                            <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-gray-400">#{user.id}</td>
                                <td className="p-4">
                                    <div className="font-medium text-white">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`badge badge-${user.role.replace('_', '-')}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => onDelete(user.id)}
                                            className="btn btn-sm btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function RequestManagementTable({ requests, onDelete }) {
    if (!requests || requests.length === 0) {
        return <div className="p-4 text-center text-gray-400">No active requests found.</div>;
    }

    return (
        <div className="glass-card overflow-hidden mt-8">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold">Request Management ({requests.length})</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-gray-700">
                            <th className="p-4 font-semibold text-gray-300">ID</th>
                            <th className="p-4 font-semibold text-gray-300">Hospital</th>
                            <th className="p-4 font-semibold text-gray-300">Blood Type</th>
                            <th className="p-4 font-semibold text-gray-300">Urgency</th>
                            <th className="p-4 font-semibold text-gray-300">Status</th>
                            <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-gray-400">#{req.id}</td>
                                <td className="p-4 font-medium">{req.hospital_name || 'Unknown'}</td>
                                <td className="p-4">
                                    <span className="font-bold text-lg">{req.blood_type}</span>
                                    <span className="text-gray-400 text-sm ml-2">x{req.units}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`badge badge-${req.urgency}`}>
                                        {req.urgency}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`badge badge-${req.status === 'fulfilled' ? 'success' : 'normal'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onDelete(req.id)}
                                        className="btn btn-sm btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
