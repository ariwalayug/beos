/**
 * Type definitions for Blood Emergency Platform
 */

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total?: number;
    page?: number;
    limit?: number;
}

// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'user' | 'donor' | 'hospital' | 'blood_bank' | 'admin';

export interface User {
    id: number;
    email: string;
    role: UserRole;
    created_at?: string;
    profileId?: number;
}

export interface AuthUser extends User {
    token?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    role: UserRole;
    name?: string;
    blood_type?: string;
    phone?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    emergency_contact?: string;
    operating_hours?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

// ============================================
// Donor Types
// ============================================

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Donor {
    id: number;
    user_id?: number;
    name: string;
    blood_type: BloodType;
    phone: string;
    email?: string;
    city: string;
    address?: string;
    available: boolean | number;
    last_donation?: string;
    latitude?: number;
    longitude?: number;
    created_at?: string;
}

export interface DonorFilters {
    blood_type?: BloodType;
    city?: string;
    available?: boolean;
}

export interface DonorStats {
    total: number;
    available: number;
    byType: Record<string, number>;
}

// ============================================
// Hospital Types
// ============================================

export interface Hospital {
    id: number;
    user_id?: number;
    name: string;
    address: string;
    city: string;
    phone: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    emergency_contact?: string;
    created_at?: string;
}

export interface HospitalFilters {
    city?: string;
    search?: string;
}

export interface HospitalStats {
    total: number;
    byCity: Array<{ city: string; count: number }>;
}

// ============================================
// Blood Bank Types
// ============================================

export interface InventoryItem {
    blood_type: BloodType;
    units: number;
    updated_at?: string;
}

export interface BloodBank {
    id: number;
    user_id?: number;
    name: string;
    address: string;
    city: string;
    phone: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    operating_hours?: string;
    inventory?: InventoryItem[];
    created_at?: string;
}

export interface BloodBatch {
    id: number;
    blood_bank_id: number;
    blood_type: BloodType;
    units: number;
    expiry_date: string;
    created_at?: string;
}

export interface BloodBankFilters {
    city?: string;
    search?: string;
    inventory?: boolean;
}

export interface TotalInventory {
    blood_type: BloodType;
    total_units: number;
}

// ============================================
// Blood Request Types
// ============================================

export type RequestUrgency = 'normal' | 'urgent' | 'critical';
export type RequestStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface BloodRequest {
    id: number;
    hospital_id?: number;
    hospital_name?: string;
    hospital_city?: string;
    hospital_phone?: string;
    donor_id?: number;
    patient_name?: string;
    age?: number;
    gender?: string;
    hemoglobin?: number;
    platelets?: number;
    blood_type: BloodType;
    units: number;
    component_type?: string;
    urgency: RequestUrgency;
    is_critical?: boolean | number;
    diagnosis?: string;
    past_reaction?: string;
    allergies?: string;
    doctor_name?: string;
    status: RequestStatus;
    contact_phone?: string;
    notes?: string;
    created_at?: string;
    fulfilled_at?: string;
}

export interface RequestFilters {
    status?: RequestStatus;
    urgency?: RequestUrgency;
    blood_type?: BloodType;
    hospital_id?: number;
}

export interface RequestStats {
    total: number;
    pending: number;
    fulfilled: number;
    critical: number;
    byBloodType: Record<string, number>;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
    donors: DonorStats;
    hospitals: HospitalStats;
    requests: RequestStats;
    inventory: TotalInventory[];
    criticalRequests: BloodRequest[];
}

// ============================================
// Admin Types
// ============================================

export interface AdminStats {
    users: {
        total: number;
        donors: number;
        hospitals: number;
        bloodBanks: number;
        admins: number;
    };
    requests: {
        total: number;
        critical: number;
        normal: number;
    };
    donations: number;
}

export interface AdminUser {
    id: number;
    email: string;
    role: UserRole;
    name: string;
    created_at: string;
}

// ============================================
// Socket Event Types
// ============================================

export interface SocketEvents {
    'connected': { message: string; timestamp: string };
    'critical-requests': BloodRequest[];
    'stats-update': { requests: RequestStats; donors: DonorStats; inventory: TotalInventory[] };
    'donor-updated': Donor;
    'new-request': BloodRequest;
    'critical-alert': BloodRequest;
    'request-updated': BloodRequest;
    'request-fulfilled': BloodRequest;
    'error': { message: string };
}

// ============================================
// Component Props Types
// ============================================

export interface ChildrenProps {
    children: React.ReactNode;
}

export interface ClassNameProps {
    className?: string;
}

export interface ProtectedRouteProps extends ChildrenProps {
    roles?: UserRole[];
}

// ============================================
// Form Types
// ============================================

export interface EmergencyRequestForm {
    patient_name: string;
    age?: number;
    gender?: string;
    hemoglobin?: number;
    platelets?: number;
    blood_type: BloodType;
    units: number;
    component_type: string;
    urgency: RequestUrgency;
    is_critical: boolean;
    diagnosis?: string;
    past_reaction?: string;
    allergies?: string;
    doctor_name?: string;
    contact_phone: string;
    notes?: string;
}

// ============================================
// Context Types
// ============================================

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    logout: () => void;
}

export interface ToastType {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export interface ToastContextType {
    showToast: (message: string, type?: ToastType['type']) => void;
}

export interface SocketContextType {
    socket: unknown;
    isConnected: boolean;
}
