// backend/middleware/adminAuth.js

import asyncHandler from 'express-async-handler';

/**
 * adminAuth middleware: Yeh verify karta hai ki authenticated user ka role 'admin' hai ya nahi.
 * NOTE: Is middleware ko hamesha 'protect' (auth.js) middleware ke baad lagaya jaana chahiye.
 * 'protect' middleware already req.user ko database user object se attach kar chuka hoga.
 */
const adminAuth = asyncHandler(async (req, res, next) => {
    // 1. Check if user object exists (Auth/protect middleware should have run first)
    // Agar 'protect' middleware sahi se chala hai, toh req.user database user object hoga.
    if (!req.user) {
        // Yeh sirf tab hona chahiye jab route mein 'protect' middleware skip ho jaaye.
        res.status(401);
        throw new Error("Not authorized: Authentication required.");
    }

    // 2. Role Check: Database se fetched user object mein role check karein
    // Isse hum token payload par nahi, balki database mein stored role par trust karte hain.
    if (req.user.role === 'admin') {
        // User is admin, proceed
        next();
    } else {
        // User is authenticated but not an admin
        res.status(403); // 403 Forbidden is correct for lack of permission
        throw new Error("Forbidden: You must be an administrator to access this route.");
    }
});

export default adminAuth;