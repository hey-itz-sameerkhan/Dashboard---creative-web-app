// ✅ Frontend/src/utils/api.js — FINAL FIXED VERSION (AUTH + GOOGLE + VERCEL SAFE)

// ================================
// 🌐 Backend URL Detection
// ================================
const getBackendURL = () => {
  const envURL = import.meta.env.VITE_BACKEND_URL?.trim();
  if (envURL) return envURL;

  if (import.meta.env.MODE === "production") {
    return "https://dashboard-creative-web-app.onrender.com";
  }

  return "http://localhost:5000";
};

export const API_URL = getBackendURL();

// ================================
// 🔑 Token Helpers
// ================================
export const getToken = () => localStorage.getItem("token") || "";

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
};

export const clearToken = () => {
  localStorage.removeItem("token");
};

// ================================
// 🔧 Utility
// ================================
const normalizeEmail = (email) => email.trim().toLowerCase();

// ================================
// ⭐ Authenticated Request Handler
// ================================
const handleAuthenticatedRequest = async (url, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = { ...options.headers };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else {
    delete headers["Content-Type"];
  }

  // ✅ Attach token if exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: "include", // ✅ important for cross-origin cookies
  };

  const finalURL = url.startsWith("http") ? url : `${API_URL}${url}`;

  const res = await fetch(finalURL, fetchOptions);

  // ================================
  // ❌ Error Handling
  // ================================
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error("Session expired. Please log in again.");
    }

    if (res.status === 403) {
      throw new Error("Access Denied.");
    }

    const errorData = await res.json().catch(() => ({
      message: res.statusText,
    }));

    throw {
      message: errorData.message || res.statusText || "Unknown error",
      status: res.status,
      response: { data: errorData },
    };
  }

  // ================================
  // ✅ Response Handling
  // ================================
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return { success: true };
};

// ================================
// 🔑 AUTH APIs (FIXED)
// ================================
export const login = async (email, password) => {
  const data = await handleAuthenticatedRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: normalizeEmail(email),
      password,
    }),
  });

  // ✅ CRITICAL FIX: Save token after login
  if (data?.token) {
    setToken(data.token);
  }

  return data;
};

export const signup = async (name, email, password) => {
  const data = await handleAuthenticatedRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email: normalizeEmail(email),
      password,
    }),
  });

  // ✅ Optional: auto-login after signup
  if (data?.token) {
    setToken(data.token);
  }

  return data;
};

// ================================
// 🔐 Google OAuth FIX
// ================================
export const checkGoogleTokenInURL = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    // ✅ SAVE TOKEN (VERY IMPORTANT FIX)
    setToken(token);

    params.delete("token");

    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;

    window.history.replaceState(null, "", newUrl);

    return token;
  }

  return null;
};

export const getGoogleAuthURL = () => `${API_URL}/api/auth/google`;

// ================================
// 👤 USER APIs
// ================================
export const fetchCurrentUser = () =>
  handleAuthenticatedRequest("/api/users/me");

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
export const fetchAllUsers = () =>
  handleAuthenticatedRequest("/api/admin/users");

export const updateUserRole = (userId, role) =>
  handleAuthenticatedRequest(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });

export const deleteUser = (userId) =>
  handleAuthenticatedRequest(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });

// ================================
// ✅ TASK APIs
// ================================
export const fetchTasks = () =>
  handleAuthenticatedRequest("/api/tasks");

export const fetchTaskById = (id) =>
  handleAuthenticatedRequest(`/api/tasks/${id}`);

export const addTask = (task) =>
  handleAuthenticatedRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });

export const updateTask = (id, task) =>
  handleAuthenticatedRequest(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });

export const updateTaskStatus = (id, status) =>
  handleAuthenticatedRequest(`/api/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteTask = (id) =>
  handleAuthenticatedRequest(`/api/tasks/${id}`, {
    method: "DELETE",
  });

// ================================
// 🔔 NOTIFICATION APIs
// ================================
export const fetchNotifications = () =>
  handleAuthenticatedRequest("/api/notifications");

export const addNotification = (noteData) =>
  handleAuthenticatedRequest("/api/notifications", {
    method: "POST",
    body: JSON.stringify(noteData),
  });

export const markSingleRead = (id) =>
  handleAuthenticatedRequest(`/api/notifications/${id}/read`, {
    method: "PUT",
  });

export const markAllRead = () =>
  handleAuthenticatedRequest("/api/notifications/read-all", {
    method: "PUT",
  });

export const deleteNotification = (id) =>
  handleAuthenticatedRequest(`/api/notifications/${id}`, {
    method: "DELETE",
  });