// backend/models/User.js (FINAL CODE - Login History Removed)

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true,
            index: true
        },
        password: { 
            type: String, 
            select: false, 
            required: function() { return this.authProvider === 'manual'; } 
        }, 
        googleId: { type: String, trim: true },
        authProvider: {
            type: String,
            enum: ["manual", "google"],
            default: "manual",
        },
        profilePic: {
            type: String,
            default: "/uploads/profile/default-avatar.jpg", 
        },
        role: {
            type: String,
            enum: ["basic", "admin"],
            default: "basic",
        },
        address: { type: String, trim: true, default: "" },
        contact: { type: String, trim: true, default: "" },
        city: { type: String, trim: true, default: "" },
        state: { type: String, trim: true, default: "" },
        pinCode: { type: String, trim: true, default: "" },

        // --- loginHistory aur lastLogin fields hata diye gaye hain ---
    },
    {
        timestamps: true,
    }
);

// Pre-save hook: Password hashing (Unchanged)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.password === undefined) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method: Password comparison (Unchanged)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model("User", userSchema);

export default User;