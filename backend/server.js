// ✅ backend/server.js — FINAL STABLE VERSION (Render + Vercel + Node 22 FIX)

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

// --------------------
// ✅ MongoDB Connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// ✅ CORS CONFIGURATION (Render + Vercel)
// --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL, // e.g. https://dashboard-creative-web-app.vercel.app
];

const VERCEL_REGEX = /^https:\/\/.*\.vercel\.app$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || VERCEL_REGEX.test(origin)) {
        return callback(null, true);
      }
      console.error("🚫 Blocked by CORS:", origin);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --------------------
// ✅ Core Middleware
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// ⚠️ UPDATED: Session Setup (Final Fix for Google OAuth State Error)
// --------------------
app.set("trust proxy", 1); // Render के लिए आवश्यक है
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Production HTTPS के लिए हमेशा TRUE
      sameSite: 'none', // Vercel/Render Cross-Origin के लिए 'none' अनिवार्य
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// --------------------
// ✅ Passport Auth
// --------------------
app.use(passport.initialize());
app.use(passport.session());

// --------------------
// ✅ Routes
// --------------------
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// --------------------
// ✅ Base Route
// --------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend running — Render + Vercel CORS fixed & verified!");
});

// --------------------
// ✅ Handle OPTIONS preflight (Express v5 safe version)
// --------------------
app.options(/.*/, cors());

// --------------------
// ✅ 404 Handler (Express v5 safe)
// --------------------
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// --------------------
// ✅ Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(res.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// --------------------
// ✅ Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`);
});