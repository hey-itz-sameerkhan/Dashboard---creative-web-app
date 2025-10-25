// backend/controllers/authController.js (FINAL CODE - Login History Removed)

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // JWT utility

// --- recordLogin & recordLogout FUNCTIONS REMOVED ---

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
    // 💡 recordLogin call REMOVED

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
  // Production में, FRONTEND_URL को env variable से लेना चाहिए
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!req.user || !req.user._id) {
    console.warn("❌ Google Auth failed: req.user not found.");
    return res.redirect(`${FRONTEND_URL}/login`); 
  }

  const user = req.user;

    // 💡 recordLogin call REMOVED

  // 1. Generate the JWT Token
  const token = generateToken(null, user._id); 

  // 2. Redirect to frontend dashboard with the token as a query parameter.
  const redirectUrl = `${FRONTEND_URL}/dashboard?token=${token}`;

  console.log(`✅ Google Auth Success! Redirecting to: ${FRONTEND_URL}/dashboard`);

  // Redirect to frontend dashboard
  res.redirect(redirectUrl);
};