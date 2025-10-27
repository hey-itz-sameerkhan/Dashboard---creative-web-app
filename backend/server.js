// backend/server.js (Updated for production-ready CORS)

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import "./config/passport.js";

dotenv.config();

// Route imports
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Database connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection failed:", err));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CORS Setup ---
const allowedOrigins = [
    "http://localhost:5173", // local dev frontend
    "https://your-vercel-domain.vercel.app", // replace with your deployed Vercel frontend URL
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow Postman, curl
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error("CORS policy does not allow access from this origin"), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// --- Session for Passport ---
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // must be true in prod (HTTPS)
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => res.send("Server is running fine ✅"));

// --- Error Handling ---
app.use((req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
