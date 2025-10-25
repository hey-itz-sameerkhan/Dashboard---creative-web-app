// backend/controllers/userController.js

import asyncHandler from "express-async-handler";
import fs from 'fs';
import multer from 'multer';
import path from 'path';

import Task from "../models/Task.js"; // Task model import
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// -----------------------------------------------------------
// 1. Multer Storage Configuration
// -----------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads/profile/';
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use req.user._id (from auth middleware)
        cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
    fileFilter: fileFilter 
});

// -----------------------------------------------------------
// 2. Auth Controllers
// -----------------------------------------------------------

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            profilePic: user.profilePic, 
            createdAt: user.createdAt,
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Bad Request
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// -----------------------------------------------------------
// 3. Profile Controllers
// -----------------------------------------------------------

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "-password -loginHistory"
    );

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            profilePic: user.profilePic,
            address: user.address,
            contact: user.contact,
            city: user.city,
            state: user.state,
            pinCode: user.pinCode,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
    const { name, address, contact, city, state, pinCode } = req.body;

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
        res.status(404);
        throw new Error("User not found.");
    }

    // Update fields
    userToUpdate.name = name !== undefined ? name : userToUpdate.name;
    userToUpdate.address = address !== undefined ? address : userToUpdate.address;
    userToUpdate.contact = contact !== undefined ? contact : userToUpdate.contact;
    userToUpdate.city = city !== undefined ? city : userToUpdate.city; 
    userToUpdate.state = state !== undefined ? state : userToUpdate.state; 
    userToUpdate.pinCode = pinCode !== undefined ? pinCode : userToUpdate.pinCode;

    const updatedUser = await userToUpdate.save();

    res.json({
        message: "Profile updated successfully!",
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider,
        profilePic: updatedUser.profilePic,
        address: updatedUser.address,
        contact: updatedUser.contact,
        city: updatedUser.city,
        state: updatedUser.state,
        pinCode: updatedUser.pinCode,
        createdAt: updatedUser.createdAt,
    });
});

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const updateProfilePic = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("No file uploaded.");
    }

    const userId = req.user._id; 
    const imageUrl = `/uploads/profile/${req.file.filename}`; 

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: imageUrl },
        { new: true, select: '-password' }
    );

    if (!updatedUser) {
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); 
        }
        res.status(404);
        throw new Error("User not found, file upload aborted.");
    }
    
    // Cleanup old file if it exists
    if (updatedUser.profilePic && updatedUser.profilePic.startsWith('/uploads/profile/')) {
        const oldFilePath = path.join('public', updatedUser.profilePic);
        if (fs.existsSync(oldFilePath) && oldFilePath !== req.file.path) {
            fs.unlinkSync(oldFilePath);
        }
    }

    res.json({
        message: "Profile picture uploaded successfully!",
        profilePicUrl: updatedUser.profilePic,
    });
});


// -------------------------------------------------------------
// 4. ADMIN CONTROLLERS
// -------------------------------------------------------------

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Find all users except the currently logged-in Admin
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
        "-password"
    );

    // Har user ke liye Total Task Count calculate karna
    const usersWithTaskCount = await Promise.all(
        users.map(async (user) => {
            const totalTasks = await Task.countDocuments({ user: user._id });
            return {
                ...user._doc, // User data spread
                totalTasks, // Naya field: Total Tasks
            };
        })
    );

    res.json(usersWithTaskCount);
});

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Admin khud apna role change nahi kar sakta
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error("Cannot change your own role via this route.");
        }

        // Role validation
        const newRole = req.body.role.toLowerCase();
        if (newRole !== "admin" && newRole !== "basic") {
            res.status(400);
            throw new Error("Invalid role provided. Must be 'admin' or 'basic'.");
        }

        user.role = newRole;
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUserAdmin = asyncHandler(async (req, res) => {
    const userToDelete = await User.findById(req.params.id);

    if (userToDelete) {
        // Admin khud apna account delete nahi kar sakta
        if (userToDelete._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error("Cannot delete your own account via this route.");
        }

        // 1. User ke saare associated tasks delete karein
        await Task.deleteMany({ user: userToDelete._id });

        // 2. Profile picture file delete karein (if exists)
        if (userToDelete.profilePic && userToDelete.profilePic.startsWith('/uploads/profile/')) {
            const filePath = path.join('public', userToDelete.profilePic);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 3. User delete karein
        await userToDelete.deleteOne();

        res.json({ message: "User and associated data deleted successfully" });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});


// -----------------------------------------------------------
// 5. Exports (Corrected to avoid Duplicate Export)
// -----------------------------------------------------------

export {
    authUser, deleteUserAdmin, getAllUsers, getUserProfile, logoutUser, registerUser, updateProfile,
    updateProfilePic, updateRole
};
