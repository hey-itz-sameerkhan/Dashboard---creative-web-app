// frontend/src/App.jsx - FINAL FIX WITH PRIVACY & TERMS PAGES

import React, { useEffect } from "react";
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

// ✅ NEW PAGES (Privacy Policy + Terms of Service)
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";

// 💡 Backend Wake-up Component (for Render Sleep Mode)
function BackendWakeUp() {
  useEffect(() => {
    const backendBaseUrl =
      import.meta.env.VITE_BACKEND_URL ||
      "https://dashboard-creative-web-app.onrender.com";

    fetch(backendBaseUrl)
      .then((res) => {
        if (res.ok) console.log("✅ Render Backend successfully Woke Up.");
      })
      .catch((err) => {
        console.warn(
          "⚠️ Backend Wake-up call completed (potential cold start).",
          err
        );
      });
  }, []);

  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <BackendWakeUp /> {/* 👈 Keeps backend awake */}
          <AuthProvider>
            <NotificationProvider>
              <TaskProvider>
                <Routes>
                  {/* ---------- PUBLIC ROUTES ---------- */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />

                  {/* ✅ PUBLIC STATIC INFO PAGES */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route
                    path="/terms-of-service"
                    element={<TermsOfService />}
                  />

                  {/* ---------- PROTECTED ROUTES (Require Login) ---------- */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Standard User Routes */}
                    <Route index element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TaskPage />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/charts" element={<ChartsPage />} />

                    {/* ---------- ADMIN ONLY ROUTES ---------- */}
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
