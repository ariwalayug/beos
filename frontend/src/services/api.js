const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Dashboard
export const getDashboard = () => fetchAPI('/api/dashboard');

// Donors
export const getDonors = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/donors${queryString ? `?${queryString}` : ''}`);
};

export const getMyDonorProfile = () => fetchAPI('/api/donors/me');

export const getDonorStats = () => fetchAPI('/api/donors/stats');

export const getDonorById = (id) => fetchAPI(`/api/donors/${id}`);

export const getDonorsByBloodType = (bloodType) => fetchAPI(`/api/donors/blood-type/${bloodType}`);

export const createDonor = (donor) => fetchAPI('/api/donors', {
    method: 'POST',
    body: JSON.stringify(donor),
});

export const updateDonor = (id, donor) => fetchAPI(`/api/donors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(donor),
});

export const deleteDonor = (id) => fetchAPI(`/api/donors/${id}`, {
    method: 'DELETE',
});

// Hospitals
export const getHospitals = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/hospitals${queryString ? `?${queryString}` : ''}`);
};

export const getMyHospitalProfile = () => fetchAPI('/api/hospitals/me');

export const getHospitalById = (id) => fetchAPI(`/api/hospitals/${id}`);

export const createHospital = (hospital) => fetchAPI('/api/hospitals', {
    method: 'POST',
    body: JSON.stringify(hospital),
});

// Blood Banks
export const getBloodBanks = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/blood-banks${queryString ? `?${queryString}` : ''}`);
};

export const getBloodBankById = (id) => fetchAPI(`/api/blood-banks/${id}`);

export const getTotalInventory = () => fetchAPI('/api/blood-banks/inventory/total');

export const findBloodBanksByType = (bloodType, minUnits = 1) =>
    fetchAPI(`/api/blood-banks/search/${bloodType}?minUnits=${minUnits}`);

export const updateBloodBankInventory = (id, bloodType, units) =>
    fetchAPI(`/api/blood-banks/${id}/inventory`, {
        method: 'PUT',
        body: JSON.stringify({ blood_type: bloodType, units }),
    });

// Blood Requests
export const getRequests = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/requests${queryString ? `?${queryString}` : ''}`);
};

export const getMyDonationHistory = () => fetchAPI('/api/requests/my-history');

export const getRequestStats = () => fetchAPI('/api/requests/stats');

export const getPendingRequests = () => fetchAPI('/api/requests/pending');

export const getCriticalRequests = () => fetchAPI('/api/requests/critical');

export const getRequestById = (id) => fetchAPI(`/api/requests/${id}`);

export const createRequest = (request) => fetchAPI('/api/requests', {
    method: 'POST',
    body: JSON.stringify(request),
});

export const updateRequest = (id, request) => fetchAPI(`/api/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
});

export const fulfillRequest = (id) => fetchAPI(`/api/requests/${id}/fulfill`, {
    method: 'PUT',
});

export const cancelRequest = (id) => fetchAPI(`/api/requests/${id}/cancel`, {
    method: 'PUT',
});

export const login = (credentials) => fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
});

export const register = (userData) => fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
});

export const getMe = () => fetchAPI('/api/auth/me');

// Blood Banks
export const getFloodBanks = getBloodBanks; // Alias if needed or fix typo
export const getMyBloodBankProfile = () => fetchAPI('/api/blood-banks/me');

export const getBatches = () => fetchAPI('/api/blood-banks/inventory/batches');

export const addBatch = (data) => fetchAPI('/api/blood-banks/inventory/batches', {
    method: 'POST',
    body: JSON.stringify(data)
});

export const updateBatch = (id, data) => fetchAPI(`/api/blood-banks/inventory/batches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
});

export const deleteBatch = (id) => fetchAPI(`/api/blood-banks/inventory/batches/${id}`, {
    method: 'DELETE'
});

// Admin Services
export const getAdminStats = () => fetchAPI('/api/admin/stats');
export const getAllUsers = () => fetchAPI('/api/admin/users');
export const deleteUser = (id) => fetchAPI(`/api/admin/users/${id}`, { method: 'DELETE' });

export default {
    login,
    register,
    getMe,
    getMyDonorProfile,
    getDashboard,
    getDonors,
    getDonorStats,
    getDonorById,
    getDonorsByBloodType,
    createDonor,
    updateDonor,
    deleteDonor,
    getHospitals,
    getHospitalById,
    getMyHospitalProfile,
    createHospital,
    getBloodBanks,
    getBloodBankById,
    getTotalInventory,
    findBloodBanksByType,
    updateBloodBankInventory,
    getRequests,
    getMyDonationHistory,
    getRequestStats,
    getPendingRequests,
    getCriticalRequests,
    getRequestById,
    createRequest,
    updateRequest,
    fulfillRequest,
    cancelRequest,
    getMyBloodBankProfile,
    getBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    getAdminStats,
    getAllUsers,
    deleteUser
};
