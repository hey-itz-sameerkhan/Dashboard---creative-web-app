// backend/controllers/authController.js (COMPLETE UPDATED CODE)

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // JWT utility

// ------------------------------------------------------------------
// 1. Manual User Registration (POST /api/auth/register)
// ------------------------------------------------------------------
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields.");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists with this email address.");
    }

    const user = await User.create({
        name,
        email,
        password,
        authProvider: 'manual',
    });

    if (user) {

        const token = generateToken(null, user._id); 
        const { password: _, ...safeUser } = user.toObject();
        

        res.status(201).json({
            success: true,
            message: 'Registration successful. Welcome!',
            user: safeUser,
            token, 
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data.");
    }
});

// ------------------------------------------------------------------
// 2. Manual User Login (POST /api/auth/login)
// ------------------------------------------------------------------
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide email and password.");
    }

    // Ensure password is selected for comparison
    const user = await User.findOne({ email }).select('+password'); 

    if (!user || user.authProvider === 'google' && !user.password) {
        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password.');
        }
        res.status(401);
        throw new Error("This email is registered via Google. Please log in with Google.");
    }

    // Verify password for manual user
    if (await user.matchPassword(password)) {
        // 💡 recordLogin call REMOVED

        const token = generateToken(null, user._id); 
        
        // CHANGES: password removed & in safeUser the theme and  profilePic added
        const { password: _, ...safeUser } = user.toObject();

        res.json({
            success: true,
            message: 'Login successful.',
            user: safeUser, 
            token, 
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password.');
    }
});

// ------------------------------------------------------------------
// 3. User Logout (POST /api/auth/logout)
// ------------------------------------------------------------------
export const logoutUser = asyncHandler(async (req, res) => {
    // 💡 recordLogout call REMOVED
    
    res.status(200).json({ message: 'User logged out successfully.' });
});


// ------------------------------------------------------------------
// 4. Google OAuth Success/Callback (GET /api/auth/google/callback)
// ------------------------------------------------------------------
export const googleSuccess = (req, res) => {
    
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!req.user || !req.user._id) {
        console.warn("❌ Google Auth failed: req.user not found.");
        return res.redirect(`${FRONTEND_URL}/login`); 
    }

    const user = req.user.toObject ? req.user.toObject() : req.user; 

    // 💡 recordLogin call REMOVED

    // 1. Generate the JWT Token
    const token = generateToken(null, user._id); 

    // 🚀 CHANGES ADDED: profilePic और theme को query parameters के रूप में भेजें
    const profilePic = user.profilePic ? encodeURIComponent(user.profilePic) : '';
    // theme को user object से लें, default 'light'
    const theme = user.theme || 'light'; 

    // 2. Redirect to frontend dashboard with the token and settings
    // CHANGES: theme और profilePic query parameters में जोड़े गए हैं।
    const redirectUrl = `${FRONTEND_URL}/dashboard?token=${token}&profilePic=${profilePic}&theme=${theme}`;

    console.log(`✅ Google Auth Success! Redirecting to: ${FRONTEND_URL}/dashboard`);

    // Redirect to frontend dashboard
    res.redirect(redirectUrl);
};