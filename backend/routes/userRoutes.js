// backend/routes/userRoutes.js

import express from "express";
import {
    updateProfile,
    updateProfilePic,
    // THEME FIX: Importing the new controller function
    updateTheme,
    upload
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* ==========================================================
 * 1. User Profile Routes (Accessed via /api/users)
 * ==========================================================
 */

/* ---------------------------------------
 * @route   GET /api/users/me
 * @desc    Get currently logged-in user's profile details
 * @access  Private (Requires JWT from 'protect' middleware)
 * ------------------------------------- */
router.get("/me", protect, async (req, res) => {
    try {
        // Fetch user data, excluding the password field
        const user = await User.findById(req.user.id)
            .select("-password")
            .lean();

        if (!user) return res.status(404).json({ message: "User not found" });

        // Ensure profile picture has a fallback default value
        const DEFAULT_PIC = "/uploads/profile/default-avatar.jpg";
        if (!user.profilePic || user.profilePic.includes("pravatar.cc")) {
            user.profilePic = DEFAULT_PIC;
        }

        res.json(user);
    } catch (err) {
        console.error("Error in /me route:", err.message);
        res.status(500).json({ message: "Server error while fetching profile" });
    }
});

/* ---------------------------------------
 * @route   PUT /api/users/profile
 * @desc    Update user's personal details (name, address, contact, etc.)
 * @access  Private
 * ------------------------------------- */
router.put("/profile", protect, updateProfile);


// 🚀 THEME FIX: New route for persistent theme setting
/* ---------------------------------------
 * @route   PUT /api/users/profile/theme
 * @desc    Update user's preferred theme (light or dark mode)
 * @access  Private
 * ------------------------------------- */
router.put("/profile/theme", protect, updateTheme);


/* ---------------------------------------
 * @route   POST /api/users/profile-picture
 * @desc    Upload/update user's profile picture file
 * @access  Private
 * ------------------------------------- */
router.post(
    "/profile-picture",
    protect,
    upload.single("profilePic"), // Use Multer middleware
    updateProfilePic
);


// ----------------------------------------------------------
// Export the router for use in server.js
// ----------------------------------------------------------
export default router;