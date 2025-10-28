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
// MongoDB connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// ✅ CORS Configuration - (FIXED & Simplified)
// --------------------

// 'process.env.FRONTEND_URL' should be set to your main Vercel production URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL, // This must be set in Render Environment Variables!
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. अगर 'origin' नहीं है (जैसे Postman/curl/server-side), तो allow करो
      if (!origin) return callback(null, true);
      
      // 2. अगर origin allowed list में है, तो allow करो
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // 3. अगर allowed list में नहीं है, तो ब्लॉक करो
        console.error("🚫 Blocked by CORS:", origin);
        return callback(new Error(`Origin ${origin} Not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Session Setup
// --------------------
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // 'secure: true' is CRITICAL for production (HTTPS)
      secure: process.env.NODE_ENV === "production",
      // 'sameSite: none' is CRITICAL for cross-domain cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// --------------------
// Passport Setup
// --------------------
app.use(passport.initialize());
app.use(passport.session());

// --------------------
// Routes
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
// Base Route
// --------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend running — CORS fixed and verified!");
});

// --------------------
// Error Handlers
// --------------------
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(res.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`)
);
