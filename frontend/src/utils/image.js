// frontend/src/utils/image.js

/**
 * ✅ BACKEND URL ko environment se load karte hain
 * agar Vercel/Vite environment me .env file me variable defined ho.
 * Fallback diya gaya hai localhost ke liye.
 */
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * किसी भी profile picture path/URL से एक full, absolute URL generate करता है।
 * यह local server paths को API_URL से resolve करता है और external URLs को वसा ही रखता है।
 *
 * @param {string} path - The image path or URL from the user object (e.g., "/uploads/profile/user-123.jpg").
 * @returns {string} The full, displayable image URL.
 */
export const getFullImageUrl = (path) => {
  // 1. Path empty या default server placeholder होने पर एक better default avatar return करें।
  if (!path || path === "https://i.pravatar.cc/40" || path === "/uploads/profile/") {
    return "https://i.pravatar.cc/120";
  }

  // 2. Agar already full URL ho (Google OAuth, external service, ya local preview Blob URL), toh wahi return karein।
  if (path.startsWith("http") || path.startsWith("https:") || path.startsWith("blob:")) {
    return path;
  }

  // 3. Agar local server path ho (e.g., '/uploads/profile/...')
  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Full URL return karo
  return `${base}${normalizedPath}`;
};
