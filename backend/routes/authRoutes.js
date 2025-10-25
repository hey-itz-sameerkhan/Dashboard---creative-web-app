// backend/routes/authRoutes.js

import express from "express";
import passport from "passport";
import { googleSuccess, loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// ------------------------------------------------------------------
// 1. Manual User Registration
// @route POST /api/auth/register
// ✅ FIX: Route is correctly defined as /register
// ------------------------------------------------------------------
router.post("/register", registerUser);

// ------------------------------------------------------------------
// 2. Manual User Login
// @route POST /api/auth/login
// ✅ FIX: Route is correctly defined as /login
// ------------------------------------------------------------------
router.post("/login", loginUser);

// ------------------------------------------------------------------
// 3. Google OAuth Start
// @route GET /api/auth/google
// ------------------------------------------------------------------
router.get(
  "/google",
  // session: true का उपयोग करें ताकि Passport session में user को store कर सके
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ------------------------------------------------------------------
// 4. Google OAuth Callback
// @route GET /api/auth/google/callback
// ------------------------------------------------------------------
router.get(
  "/google/callback",
  // 1. Passport user data को session में store करेगा (req.user उपलब्ध होगा)
  passport.authenticate("google", { failureRedirect: "/login" }),
  // 2. अब googleSuccess Controller user object (req.user) का उपयोग करके JWT Token generate करेगा
  //    और उसे Frontend के लिए redirect URL में query parameter के रूप में भेजेगा।
  googleSuccess
);

export default router;
