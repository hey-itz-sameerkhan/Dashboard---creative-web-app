// frontend/src/App.jsx - FINAL FIX FOR RENDER SLEEP MODE

import React, { useEffect } from "react"; // 👈 useEffect IMPORTED
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Context Imports
import { AuthProvider } from "./context/AuthContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

// Component Imports
import AdminOnlyRoute from "./components/AdminOnlyRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Page Imports
import Account from "./pages/Account.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUserManagement from "./pages/AdminUserManagement.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ChartsPage from "./pages/ChartsPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import TaskPage from "./pages/TaskPage.jsx";

// आपके .env फ़ाइल से BACKEND_URL लें
// Vite में Environment Variables 'VITE_' से शुरू होने चाहिए।
// मान लिया कि आपकी .env फ़ाइल में VITE_BACKEND_URL=... है।
// अगर नहीं, तो यह सीधे BACKEND_URL से ले लेगा अगर यह किसी और तरीके से उपलब्ध हो।
// चूंकि आपने BACKEND_URL=https://dashboard-creative-web-app.onrender.com सेट किया है,
// हम इसे सीधे यहां हार्डकोड कर सकते हैं या .env से ले सकते हैं।
// सुरक्षा के लिए, मैं इसे आपके कोड के अनुसार Vercel .env से लेने का तरीका दिखा रहा हूँ।

// 💡 FIX 1: Backend Wake-up Logic
function BackendWakeUp() {
  useEffect(() => {
    // यह Render Backend URL है (जो आपने .env में दिखाया है)
    // Production में यह Vercel environment variable से आएगा
    const backendBaseUrl =
      import.meta.env.VITE_BACKEND_URL ||
      "https://dashboard-creative-web-app.onrender.com";

    // एक साधारण, खाली GET request, जो Render को Sleep Mode से जगा देगा।
    // हम Base Route पर रिक्वेस्ट कर रहे हैं, जो server.js में सिर्फ़ '🚀 Backend running' भेजता है।
    fetch(backendBaseUrl)
      .then((res) => {
        // हम response data को ignore कर सकते हैं, बस status 200/OK चाहिए
        if (res.ok) {
          console.log("✅ Render Backend successfully Woke Up.");
        }
      })
      .catch((err) => {
        // अगर पहली request fail हो भी जाए (जैसे connection error), तो भी यह backend को start कर देगा
        console.warn(
          "⚠️ Backend Wake-up call completed (potential cold start).",
          err
        );
      });
  }, []);

  return null; // यह कंपोनेंट कुछ render नहीं करता है
}

export default function App() {
  return (
    // FIX 2: BackendWakeUp component को सबसे ऊपर जोड़ें
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <BackendWakeUp /> {/* 👈 WAKE UP COMPONENT ADDED HERE */}
          <AuthProvider>
            <NotificationProvider>
              <TaskProvider>
                <Routes>
                  {/* ---------------- PUBLIC ROUTES ---------------- */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />

                  {/* ---------------- PROTECTED ROUTES WRAPPER ---------------- */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Standard User Routes - AppLayout ke andar Nested hain */}
                    <Route index element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TaskPage />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/charts" element={<ChartsPage />} />

                    {/* ---------------- ADMIN ONLY ROUTES ---------------- */}
                    <Route element={<AdminOnlyRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route
                        path="/admin/users"
                        element={<AdminUserManagement />}
                      />
                    </Route>
                  </Route>
                </Routes>
              </TaskProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}
