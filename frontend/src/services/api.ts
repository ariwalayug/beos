import {
    ApiResponse,
    User,
    AuthResponse,
    Donor,
    DonorStats,
    Hospital,
    BloodBank,
    TotalInventory,
    BloodBatch,
    BloodRequest,
    RequestStats,
    DashboardStats,
    AdminStats,
    AdminUser,
    BloodType,
} from '../types';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: FetchOptions = {
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
export const getDashboard = (): Promise<ApiResponse<DashboardStats>> =>
    fetchAPI('/api/dashboard');

// Donors
export const getDonors = (params: Record<string, string> = {}): Promise<ApiResponse<Donor[]>> => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/donors${queryString ? `?${queryString}` : ''}`);
};

export const getMyDonorProfile = (): Promise<ApiResponse<Donor>> =>
    fetchAPI('/api/donors/me');

export const getDonorStats = (): Promise<ApiResponse<DonorStats>> =>
    fetchAPI('/api/donors/stats');

export const getDonorById = (id: number): Promise<ApiResponse<Donor>> =>
    fetchAPI(`/api/donors/${id}`);

export const getDonorsByBloodType = (bloodType: BloodType): Promise<ApiResponse<Donor[]>> =>
    fetchAPI(`/api/donors/blood-type/${bloodType}`);

export const createDonor = (donor: Partial<Donor>): Promise<ApiResponse<Donor>> =>
    fetchAPI('/api/donors', {
        method: 'POST',
        body: JSON.stringify(donor),
    });

export const updateDonor = (id: number, donor: Partial<Donor>): Promise<ApiResponse<Donor>> =>
    fetchAPI(`/api/donors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(donor),
    });

export const deleteDonor = (id: number): Promise<ApiResponse<void>> =>
    fetchAPI(`/api/donors/${id}`, {
        method: 'DELETE',
    });

// Hospitals
export const getHospitals = (params: Record<string, string> = {}): Promise<ApiResponse<Hospital[]>> => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/hospitals${queryString ? `?${queryString}` : ''}`);
};

export const getMyHospitalProfile = (): Promise<ApiResponse<Hospital>> =>
    fetchAPI('/api/hospitals/me');

export const getHospitalById = (id: number): Promise<ApiResponse<Hospital>> =>
    fetchAPI(`/api/hospitals/${id}`);

export const createHospital = (hospital: Partial<Hospital>): Promise<ApiResponse<Hospital>> =>
    fetchAPI('/api/hospitals', {
        method: 'POST',
        body: JSON.stringify(hospital),
    });

// Blood Banks
export const getBloodBanks = (params: Record<string, string> = {}): Promise<ApiResponse<BloodBank[]>> => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/blood-banks${queryString ? `?${queryString}` : ''}`);
};

export const getBloodBankById = (id: number): Promise<ApiResponse<BloodBank>> =>
    fetchAPI(`/api/blood-banks/${id}`);

export const getTotalInventory = (): Promise<ApiResponse<TotalInventory[]>> =>
    fetchAPI('/api/blood-banks/inventory/total');

export const findBloodBanksByType = (bloodType: BloodType, minUnits: number = 1): Promise<ApiResponse<BloodBank[]>> =>
    fetchAPI(`/api/blood-banks/search/${bloodType}?minUnits=${minUnits}`);

export const updateBloodBankInventory = (
    id: number,
    bloodType: BloodType,
    units: number
): Promise<ApiResponse<BloodBank>> =>
    fetchAPI(`/api/blood-banks/${id}/inventory`, {
        method: 'PUT',
        body: JSON.stringify({ blood_type: bloodType, units }),
    });

// Blood Requests
export const getRequests = (params: Record<string, string> = {}): Promise<ApiResponse<BloodRequest[]>> => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/requests${queryString ? `?${queryString}` : ''}`);
};

export const getMyDonationHistory = (): Promise<ApiResponse<BloodRequest[]>> =>
    fetchAPI('/api/requests/my-history');

export const getRequestStats = (): Promise<ApiResponse<RequestStats>> =>
    fetchAPI('/api/requests/stats');

export const getPendingRequests = (): Promise<ApiResponse<BloodRequest[]>> =>
    fetchAPI('/api/requests/pending');

export const getCriticalRequests = (): Promise<ApiResponse<BloodRequest[]>> =>
    fetchAPI('/api/requests/critical');

export const getRequestById = (id: number): Promise<ApiResponse<BloodRequest>> =>
    fetchAPI(`/api/requests/${id}`);

export const createRequest = (request: Partial<BloodRequest>): Promise<ApiResponse<BloodRequest>> =>
    fetchAPI('/api/requests', {
        method: 'POST',
        body: JSON.stringify(request),
    });

export const updateRequest = (id: number, request: Partial<BloodRequest>): Promise<ApiResponse<BloodRequest>> =>
    fetchAPI(`/api/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
    });

export const fulfillRequest = (id: number): Promise<ApiResponse<BloodRequest>> =>
    fetchAPI(`/api/requests/${id}/fulfill`, {
        method: 'PUT',
    });

export const cancelRequest = (id: number): Promise<ApiResponse<BloodRequest>> =>
    fetchAPI(`/api/requests/${id}/cancel`, {
        method: 'PUT',
    });

// Authentication
export const login = (credentials: { email: string; password: string }): Promise<AuthResponse> =>
    fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

export const register = (userData: Record<string, unknown>): Promise<AuthResponse> =>
    fetchAPI('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

export const getMe = (): Promise<ApiResponse<User>> =>
    fetchAPI('/api/auth/me');

// Blood Banks (additional)
export const getFloodBanks = getBloodBanks; // Alias

export const getMyBloodBankProfile = (): Promise<ApiResponse<BloodBank>> =>
    fetchAPI('/api/blood-banks/me');

export const getBatches = (): Promise<ApiResponse<BloodBatch[]>> =>
    fetchAPI('/api/blood-banks/inventory/batches');

export const addBatch = (data: Partial<BloodBatch>): Promise<ApiResponse<BloodBatch>> =>
    fetchAPI('/api/blood-banks/inventory/batches', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateBatch = (id: number, data: Partial<BloodBatch>): Promise<ApiResponse<BloodBatch>> =>
    fetchAPI(`/api/blood-banks/inventory/batches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteBatch = (id: number): Promise<ApiResponse<void>> =>
    fetchAPI(`/api/blood-banks/inventory/batches/${id}`, {
        method: 'DELETE',
    });

// Admin Services
export const getAdminStats = (): Promise<ApiResponse<AdminStats>> =>
    fetchAPI('/api/admin/stats');

export const getAllUsers = (): Promise<ApiResponse<AdminUser[]>> =>
    fetchAPI('/api/admin/users');

export const deleteUser = (id: number): Promise<ApiResponse<void>> =>
    fetchAPI(`/api/admin/users/${id}`, { method: 'DELETE' });

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
    deleteUser,

    // Organ Services (Enterprise)
    getOrgans,
    getOrganById,
    logOrgan,
    updateOrganStatus,
    getOrganMatches,
    getUrgentOrgans,
    getOrganStats,

    // AI Services (Enterprise)
    getDemandPrediction,
    getExpiringBlood,
    getTransferSuggestions,
    getSmartMatches,
    getAiInsights,
};

// Organ Services Implementation
export const getOrgans = (params: Record<string, any> = {}): Promise<ApiResponse<any[]>> => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/api/organs${queryString ? `?${queryString}` : ''}`);
};

export const getOrganById = (id: number): Promise<ApiResponse<any>> =>
    fetchAPI(`/api/organs/${id}`);

export const logOrgan = (organ: any): Promise<ApiResponse<any>> =>
    fetchAPI('/api/organs', {
        method: 'POST',
        body: JSON.stringify(organ),
    });

export const updateOrganStatus = (id: number, status: string, recipientId?: number): Promise<ApiResponse<any>> =>
    fetchAPI(`/api/organs/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, recipient_id: recipientId }),
    });

export const getOrganMatches = (id: number): Promise<ApiResponse<any[]>> =>
    fetchAPI(`/api/organs/${id}/matches`);

export const getUrgentOrgans = (): Promise<ApiResponse<any[]>> =>
    fetchAPI('/api/organs/urgent');

export const getOrganStats = (): Promise<ApiResponse<any>> =>
    fetchAPI('/api/organs/stats');

// AI Services Implementation
export const getDemandPrediction = (days: number = 7): Promise<ApiResponse<any>> =>
    fetchAPI(`/api/ai/predict-demand?days=${days}`);

export const getExpiringBlood = (days: number = 7): Promise<ApiResponse<any[]>> =>
    fetchAPI(`/api/ai/expiring?days=${days}`);

export const getTransferSuggestions = (): Promise<ApiResponse<any[]>> =>
    fetchAPI('/api/ai/suggest-transfers');

export const getSmartMatches = (requestId: number): Promise<ApiResponse<any[]>> =>
    fetchAPI(`/api/ai/smart-match/${requestId}`);

export const getAiInsights = (): Promise<ApiResponse<any>> =>
    fetchAPI('/api/ai/insights');
