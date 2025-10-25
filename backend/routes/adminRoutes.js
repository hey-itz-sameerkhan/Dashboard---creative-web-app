// backend/routes/adminRoutes.js

import express from "express";
import {
    deleteUser,
    getAllUsers,
    getDashboardStats // ✅ NEW
    ,
    updateUserRole
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", protect, adminAuth, getAllUsers);
router.put("/users/:id/role", protect, adminAuth, updateUserRole);
router.delete("/users/:id", protect, adminAuth, deleteUser);

// ✅ NEW: Dashboard stats
router.get("/dashboard-stats", protect, adminAuth, getDashboardStats);

export default router;
