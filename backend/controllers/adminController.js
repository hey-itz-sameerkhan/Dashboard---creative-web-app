// backend/controllers/adminController.js

import asyncHandler from 'express-async-handler';
import Task from "../models/Task.js";
import User from "../models/User.js";

// @desc    Get all non-admin users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } })
        .select('-password -googleId -__v -loginHistory') 
        .sort({ createdAt: -1 });

    res.json(users);
});

// @desc    Update a specific user's role (basic/admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['basic', 'admin'].includes(role)) {
        res.status(400);
        throw new Error("Invalid role specified.");
    }

    if (req.user._id.toString() === userId) { 
        res.status(403);
        throw new Error("You cannot change your own role.");
    }

    const user = await User.findById(userId);
    
    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role}`, user: user.toObject() });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
        res.status(403);
        throw new Error("You cannot delete your own account via Admin Panel.");
    }

    const user = await User.findById(userId);
    
    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }

    await Task.deleteMany({ createdBy: userId });
    await Task.updateMany(
        { assignedTo: userId },
        { $pull: { assignedTo: userId } }
    );
    
    await User.deleteOne({ _id: userId });

    res.json({ message: `User ${user.name} and all associated data deleted successfully.` });
});

// -----------------------------------------------------------
// ✅ NEW: Admin Dashboard Stats
// -----------------------------------------------------------

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
    // Total users excluding admins
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // All tasks
    const allTasks = await Task.find({})
        .select('status createdAt')
        .sort({ createdAt: 1 }); // oldest to newest

    const totalTasks = allTasks.length;

    // Only include tasks with valid createdAt
    const validTasks = allTasks.filter(task => task.createdAt && !isNaN(new Date(task.createdAt)));

    res.json({
        totalUsers,
        totalTasks,
        allTasks: validTasks,
    });
});
