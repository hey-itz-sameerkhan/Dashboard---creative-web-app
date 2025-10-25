// backend/routes/userRoutes.js (FINAL CODE - Login Activity Removed)

import express from "express";
// 💡 getLoginActivity ko import se hata diya gaya hai
import { updateProfile, updateProfilePic, upload } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js"; // This is already correctly imported

const router = express.Router();

/* ---------------------------------------
 * @route   GET /api/users/me
 * @desc    Get currently logged-in user's profile
 * @access  Private
 * ------------------------------------- */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Default profile picture if missing
    const DEFAULT_PIC = "/uploads/profile/default-avatar.jpg";
    if (!user.profilePic || user.profilePic.includes("pravatar.cc")) {
      user.profilePic = DEFAULT_PIC;
    }

    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err.message);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// --- '/activity' ROUTE REMOVED ---
/* // 💡 OLD ROUTE: 
router.get("/activity", protect, getLoginActivity); 
*/


/* ---------------------------------------
 * @route   PUT /api/users/profile
 * @desc    Update user's profile details
 * @access  Private
 * ------------------------------------- */
router.put("/profile", protect, updateProfile);

/* ---------------------------------------
 * @route   POST /api/users/profile-picture
 * @desc    Upload/update profile picture
 * @access  Private
 * ------------------------------------- */
router.post(
  "/profile-picture",
  protect,
  upload.single("profilePic"),
  updateProfilePic
);

export default router;