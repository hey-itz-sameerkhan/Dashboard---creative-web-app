// backend/controllers/authController.js — FINAL FIXED VERSION

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ================================
// 1. REGISTER
// ================================
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required." });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  const user = await User.create({
    name,
    email,
    password,
    authProvider: "manual",
  });

  const token = generateToken(user._id); // ✅ FIXED

  const { password: _, ...safeUser } = user.toObject();

  res.status(201).json({
    success: true,
    user: safeUser,
    token,
  });
});

// ================================
// 2. LOGIN
// ================================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required." });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  if (user.authProvider === "google" && !user.password) {
    return res.status(401).json({
      message: "Use Google login for this account.",
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = generateToken(user._id); // ✅ FIXED

  const { password: _, ...safeUser } = user.toObject();

  res.json({
    success: true,
    user: safeUser,
    token,
  });
});

// ================================
// 3. LOGOUT
// ================================
export const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Logged out." });
});

// ================================
// 4. GOOGLE CALLBACK
// ================================
export const googleSuccess = (req, res) => {
  const FRONTEND_URL =
    process.env.FRONTEND_URL || "http://localhost:5173";

  if (!req.user || !req.user._id) {
    console.warn("❌ Google Auth failed");
    return res.redirect(`${FRONTEND_URL}/login`);
  }

  const token = generateToken(req.user._id); // ✅ FIXED

  // ✅ CLEAN REDIRECT (ONLY TOKEN)
  const redirectUrl = `${FRONTEND_URL}/dashboard?token=${token}`;

  console.log("✅ Google login success");

  res.redirect(redirectUrl);
};