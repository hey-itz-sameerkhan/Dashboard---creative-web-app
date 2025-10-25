// frontend/src/utils/api.js (FINALIZED: ACTIVITY API REMOVED)

// ✅ API Base URL
export const API_URL = "http://localhost:5000";

// ================================
// 🔑 Token helpers
// ================================
export const getToken = () => localStorage.getItem("token") || ""; 
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => {
    localStorage.removeItem("token");
};

// ================================
// 🔧 Utility
// ================================
const normalizeEmail = (email) => email.trim().toLowerCase();

/**
 * @typedef {Object} ErrorResponse
 * @property {string} message - Error message from the server or default.
 * @property {number} status - HTTP status code.
 * @property {Object} [response] - The parsed JSON error body.
 */

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
// 🔑 AUTH/USER APIs (fetchLoginActivity REMOVED)
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

export const fetchCurrentUser = async () => {
    return handleAuthenticatedRequest(`${API_URL}/api/users/me`);
};

export const updateProfile = async (profileData) => {
    return handleAuthenticatedRequest(`${API_URL}/api/users/profile`, {
        method: "PUT",
        body: JSON.stringify(profileData),
    });
};

export const updateProfilePicture = async (formData) => {
    return handleAuthenticatedRequest(`${API_URL}/api/users/profile-picture`, {
        method: "POST",
        body: formData,
    });
};

// ================================
// 🚀 ADMIN APIs (User Management)
// ================================

// GET all non-admin users
export const fetchAllUsers = async () => 
    handleAuthenticatedRequest(`${API_URL}/api/admin/users`);

// PUT update user role
export const updateUserRole = async (userId, role) =>
    handleAuthenticatedRequest(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
    });

// DELETE a user
export const deleteUser = async (userId) =>
    handleAuthenticatedRequest(`${API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
    });


// ================================
// 📝 ACTIVITY APIs (REMOVED)
// ================================
// 💡 fetchLoginActivity function removed

// ================================
// ✅ TASK APIs
// ================================

// GET all tasks
export const fetchTasks = async () => 
    handleAuthenticatedRequest(`${API_URL}/api/tasks`);

// GET task by ID 
export const fetchTaskById = async (id) => 
    handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}`); 

// POST new task
export const addTask = async (task) =>
    handleAuthenticatedRequest(`${API_URL}/api/tasks`, { method: "POST", body: JSON.stringify(task) });

// PUT/PATCH update existing task (for creator only)
export const updateTask = async (id, task) =>
    handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) });

// PATCH to update Task Status only (for creator or assigned user)
export const updateTaskStatus = async (id, status) =>
    handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}/status`, { 
        method: "PATCH", 
        body: JSON.stringify({ status }) 
    });


// DELETE a task
export const deleteTask = async (id) =>
    handleAuthenticatedRequest(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });

// ================================
// ⭐ NOTIFICATION APIs
// ================================
export const fetchNotifications = async () =>
    handleAuthenticatedRequest(`${API_URL}/api/notifications`);

export const addNotification = async (noteData) =>
    handleAuthenticatedRequest(`${API_URL}/api/notifications`, {
        method: "POST",
        body: JSON.stringify(noteData),
    });

export const markSingleRead = async (id) =>
    handleAuthenticatedRequest(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
    });

export const markAllRead = async () =>
    handleAuthenticatedRequest(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
    });
    
// DELETE a single notification
export const deleteNotification = async (id) =>
    handleAuthenticatedRequest(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
    });



