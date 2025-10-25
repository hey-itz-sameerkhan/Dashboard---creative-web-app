// backend/middleware/auth.js

import asyncHandler from 'express-async-handler';
import jwt from "jsonwebtoken";
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Bearer Token Check (Frontend/Manual Auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } 
    
    // 2. Cookie Check (Google Auth)
    if (!token && req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized — token missing or invalid.");
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Extract User ID
        // Token payload se ID nikaalte hain (chahe 'id' ho ya 'userId')
        const userId = decoded.userId || decoded.id; 

        if (!userId) {
           res.status(401);
           throw new Error("Not authorized — Invalid token payload (ID missing).");
        }

        // 5. Get the full user object from the database, excluding password
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            res.status(404);
            throw new Error("User not found.");
        }

        // 6. IMPORTANT FIX: Attach the Mongoose user object to req.user.
        // Mongoose automatically provides the virtual 'id' getter, 
        // but explicitly defining it here ensures compatibility everywhere.
        req.user = user; 
        
        // 💡 Multer aur purane logic ke liye compatibility add karein:
        // req.user.id ab req.user._id ki value ko point karega.
        req.user.id = user._id.toString();
        
        next();
    } catch (error) {
        // Token verification failed (e.g., expired, modified, bad signature)
        res.status(401); 
        throw new Error("Not authorized — invalid or expired token.");
    }
});