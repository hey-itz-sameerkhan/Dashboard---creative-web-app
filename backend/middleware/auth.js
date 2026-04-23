// backend/middleware/auth.js — FINAL FIXED VERSION

import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ================================
  // 1. Get token from Authorization header
  // ================================
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // ================================
  // 2. Fallback: Cookie (Google Auth)
  // ================================
  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  // ================================
  // 3. No token
  // ================================
  if (!token) {
    console.warn("❌ No token received in request");
    return res.status(401).json({
      message: "Not authorized — token missing",
    });
  }

  try {
    // ================================
    // 4. Verify Token
    // ================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug (important for production)
    console.log("✅ Token decoded:", decoded);

    const userId = decoded.userId || decoded.id;

    if (!userId) {
      console.error("❌ Token payload missing user ID");
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    // ================================
    // 5. Fetch user from DB
    // ================================
    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.error("❌ User not found for token");
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ================================
    // 6. Attach user to request
    // ================================
    req.user = user;
    req.user.id = user._id.toString();

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);

    return res.status(401).json({
      message: "Not authorized — token invalid or expired",
    });
  }
});