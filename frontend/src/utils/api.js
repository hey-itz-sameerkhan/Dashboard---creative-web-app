// ✅ Frontend/src/utils/api.js — FINAL VERCEL FIXED VERSION

// Automatically detect backend (Render for production / localhost for dev)
const getBackendURL = () => {
  const envURL = import.meta.env.VITE_BACKEND_URL?.trim();
  if (envURL) return envURL;

  // ✅ Use your Render backend by default
  if (import.meta.env.MODE === "production") {
    return "https://dashboard-creative-web-app.onrender.com";
  }

  // ✅ Fallback to local dev
  return "http://localhost:5000";
};

export const API_URL = getBackendURL();

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
  if (!isFormData) headers["Content-Type"] = "application/json";
  else delete headers["Content-Type"];

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fetchOptions = {
    ...options,
    headers,
    credentials: "include", // ✅ Needed for session cookies / Render auth
  };

  // 🚀 Automatic full URL join
  const finalURL = url.startsWith("http") ? url : `${API_URL}${url}`;

  const res = await fetch(finalURL, fetchOptions);

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error("Session expired. Please log in again.");
    }
    if (res.status === 403) {
      throw new Error("Access Denied: You do not have permission.");
    }

    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw {
      message: errorData.message || res.statusText || "Unknown error occurred.",
      status: res.status,
      response: { data: errorData },
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
export const login = async (email, password) =>
  handleAuthenticatedRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  });

export const signup = async (name, email, password) =>
  handleAuthenticatedRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email: normalizeEmail(email), password }),
  });

export const checkGoogleTokenInURL = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    params.delete("token");
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState(null, "", newUrl);
    return token;
  }
  return null;
};

export const getGoogleAuthURL = () => `${API_URL}/api/auth/google`;
export const fetchCurrentUser = () => handleAuthenticatedRequest("/api/users/me");
export const updateProfile = (profileData) =>
  handleAuthenticatedRequest("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });

export const updateProfilePicture = (formData) =>
  handleAuthenticatedRequest("/api/users/profile-picture", {
    method: "POST",
    body: formData,
  });

// ================================
// 🚀 ADMIN APIs
// ================================
export const fetchAllUsers = () => handleAuthenticatedRequest("/api/admin/users");
export const updateUserRole = (userId, role) =>
  handleAuthenticatedRequest(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
export const deleteUser = (userId) =>
  handleAuthenticatedRequest(`/api/admin/users/${userId}`, { method: "DELETE" });

// ================================
// ✅ TASK APIs
// ================================
export const fetchTasks = () => handleAuthenticatedRequest("/api/tasks");
export const fetchTaskById = (id) => handleAuthenticatedRequest(`/api/tasks/${id}`);
export const addTask = (task) =>
  handleAuthenticatedRequest("/api/tasks", { method: "POST", body: JSON.stringify(task) });
export const updateTask = (id, task) =>
  handleAuthenticatedRequest(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) });
export const updateTaskStatus = (id, status) =>
  handleAuthenticatedRequest(`/api/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const deleteTask = (id) =>
  handleAuthenticatedRequest(`/api/tasks/${id}`, { method: "DELETE" });

// ================================
// ⭐ NOTIFICATION APIs
// ================================
export const fetchNotifications = () => handleAuthenticatedRequest("/api/notifications");
export const addNotification = (noteData) =>
  handleAuthenticatedRequest("/api/notifications", { method: "POST", body: JSON.stringify(noteData) });
export const markSingleRead = (id) =>
  handleAuthenticatedRequest(`/api/notifications/${id}/read`, { method: "PUT" });
export const markAllRead = () => handleAuthenticatedRequest("/api/notifications/read-all", { method: "PUT" });
export const deleteNotification = (id) =>
  handleAuthenticatedRequest(`/api/notifications/${id}`, { method: "DELETE" });
