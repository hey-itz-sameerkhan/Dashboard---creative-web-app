// frontend/src/utils/api.js (Updated for Vercel + Render)

// ✅ API Base URL (dynamic using VITE_BACKEND_URL)
const API_URL = import.meta.env.VITE_BACKEND_URL;

// ================================
// 🔑 Token helpers
// ================================
export const getToken = () => localStorage.getItem("token") || ""; 
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

// ================================
// 🔧 Utility
// ================================
const normalizeEmail = (email) => email.trim().toLowerCase();

// ================================
// ⭐ Consolidated Authenticated Request Handler
// ================================
const handleAuthenticatedRequest = async (url, options = {}) => {
    const token = getToken(); 
    const isFormData = options.body instanceof FormData;

    const headers = { ...options.headers };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    } else {
        delete headers['Content-Type']; 
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        ...options,
        headers,
    };

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
        if (res.status === 401) {
            console.error("Authentication Failed: 401 Unauthorized. Session expired or missing token.");
            clearToken();
            throw new Error('Session expired. Please log in again.'); 
        }
        if (res.status === 403) {
            throw new Error('Access Denied: You do not have permission to perform this action.');
        }
        
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        
        throw { 
            message: errorData.message || res.statusText || 'Unknown error occurred.',
            status: res.status,
            response: { data: errorData }
        };
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    
    return { message: "Operation successful.", success: true };
};

// ================================
// 🔑 AUTH/USER APIs
// ================================
export const login = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    return handleAuthenticatedRequest(`${API_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
    });
};

export const signup = async (name, email, password) => {
    const normalizedEmail = normalizeEmail(email);
    return handleAuthenticatedRequest(`${API_URL}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({ name, email: normalizedEmail, password }),
    });
};

export const checkGoogleTokenInURL = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
        params.delete('token');
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState(null, '', newUrl);

        return token;
    }
    return null;
};

export const getGoogleAuthURL = () => `${API_URL}/api/auth/google`;

export const fetchCurrentUser = async () => handleAuthenticatedRequest(`${API_URL}/api/users/me`);

export const updateProfile = async (profileData) => handleAuthenticatedRequest(`${API_URL}/api/users/profile`, {
    method: "PUT",
    body: JSON.stringify(profileData),
});

export const updateProfilePicture = async (formData) => handleAuthenticatedRequest(`${API_URL}/api/users/profile-picture`, {
    method: "POST",
    body: formData,
});

// ================================
// 🚀 ADMIN APIs
// ================================
export const fetchAllUsers = async () => handleAuthenticatedRequest(`${API_URL}/api/admin/users`);

export const updateUserRole = async (userId, role) => handleAuthenticatedRequest(`${API_URL}/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
});

export const deleteUser = async (userId) => handleAuthenticatedRequest(`${API_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
});

// ================================
// ✅ TASK APIs
// ================================
export const fetchTasks = async () => handleAuthenticatedRequest(`${API_URL}/api/tasks`);
export const fetchTaskById = async (id) => handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}`); 
export const addTask = async (task) => handleAuthenticatedRequest(`${API_URL}/api/tasks`, { method: "POST", body: JSON.stringify(task) });
export const updateTask = async (id, task) => handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) });
export const updateTaskStatus = async (id, status) => handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const deleteTask = async (id) => handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });

// ================================
// ⭐ NOTIFICATION APIs
// ================================
export const fetchNotifications = async () => handleAuthenticatedRequest(`${API_URL}/api/notifications`);

export const addNotification = async (noteData) => handleAuthenticatedRequest(`${API_URL}/api/notifications`, {
    method: "POST",
    body: JSON.stringify(noteData),
});

export const markSingleRead = async (id) => handleAuthenticatedRequest(`${API_URL}/api/notifications/${id}/read`, { method: "PUT" });
export const markAllRead = async () => handleAuthenticatedRequest(`${API_URL}/api/notifications/read-all`, { method: "PUT" });
export const deleteNotification = async (id) => handleAuthenticatedRequest(`${API_URL}/api/notifications/${id}`, { method: "DELETE" });
