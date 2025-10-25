// client/src/utils/image.js

// API_URL को import करना ज़ूरी है।
import { API_URL } from "./api"; // Ensure you have this import

/**
 * किसी भी profile picture path/URL से एक full, absolute URL generate करता है।
 * यह local server paths को API_URL से resolve करता है और external URLs को waisa hi rakhta hai।
 *
 * @param {string} path - The image path or URL from the user object (e.g., "/uploads/profile/user-123.jpg").
 * @returns {string} The full, displayable image URL.
 */
export const getFullImageUrl = (path) => {
    // 1. Path empty या default server placeholder होने पर एक better default avatar return करें।
    // 'https://i.pravatar.cc/40' aapka database default hai. 'https://i.pravatar.cc/120' ek slightly larger default hai.
    if (!path || path === "https://i.pravatar.cc/40" || path === "/uploads/profile/") {
        return "https://i.pravatar.cc/120"; 
    }
    
    // 2. Agar already full URL हो (Google OAuth, external service, ya local preview Blob URL), toh wahi return karein।
    if (path.startsWith('http') || path.startsWith('https:') || path.startsWith('blob:')) {
        return path;
    }
    
    // 3. Agar local server path ho (e.g., '/uploads/profile/...')
    
    // API_URL को normalize karte hain: trailing slash हटा देते हैं अगर हो तोह।
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    
    // Path को normalize karte hain: leading slash lagate hain agar missing ho toh.
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Full URL return karo
    return `${base}${normalizedPath}`;
};
