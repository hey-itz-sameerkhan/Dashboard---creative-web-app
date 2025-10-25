// frontend/src/App.jsx
import React from "react";
// BrowserRouter ko Routes ke charon or wrap karne ki avashyakta hai
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Context Imports - FIX: Structure ke anusaar sabhi files .jsx hain.
// 💡 ActivityProvider REMOVED
import { AuthProvider } from "./context/AuthContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

// Component Imports - FIX: Structure ke anusaar sabhi files .jsx hain.
import AdminOnlyRoute from "./components/AdminOnlyRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Page Imports - FIX: Structure ke anusaar sabhi files .jsx hain.
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
// Note: TaskCharts.jsx file hai, par App.jsx mein imported nahi hai.

export default function App() {
  return (
    // Provider Nesting Order: Toast & Confirm (no dependencies) -> Auth -> Notification/Activity/Task (depend on Auth)
    <ToastProvider>
           {" "}
      <ConfirmProvider>
               {" "}
        <BrowserRouter>
                   {" "}
          <AuthProvider>
                       {" "}
            <NotificationProvider>
                            {/* 💡 ActivityProvider REMOVED from wrapping */}   
                   {" "}
              <TaskProvider>
                               {" "}
                <Routes>
                                   {" "}
                  {/* ---------------- PUBLIC ROUTES ---------------- */}
                                    <Route path="/login" element={<Login />} /> 
                                  <Route path="/signup" element={<SignUp />} /> 
                                 {" "}
                  {/* ---------------- PROTECTED ROUTES WRAPPER ---------------- */}
                                   {" "}
                  <Route
                    element={
                      <ProtectedRoute>
                                                <AppLayout /> {" "}
                      </ProtectedRoute>
                    }
                  >
                                       {" "}
                    {/* Standard User Routes - AppLayout ke andar Nested hain */}
                                        <Route index element={<Home />} />     
                                 {" "}
                    <Route path="/dashboard" element={<Dashboard />} />         
                              <Route path="/tasks" element={<TaskPage />} />   
                                   {" "}
                    <Route path="/account" element={<Account />} />             
                          <Route path="/calendar" element={<CalendarPage />} /> 
                                     {" "}
                    <Route path="/charts" element={<ChartsPage />} />       {" "}
                    {/* ---------------- ADMIN ONLY ROUTES ---------------- */} 
                                   {" "}
                    <Route element={<AdminOnlyRoute />}>
                                           {" "}
                      <Route path="/admin" element={<AdminDashboard />} />     
                                     {" "}
                      <Route
                        path="/admin/users"
                        element={<AdminUserManagement />}
                      />
                                         {" "}
                    </Route>
                                     {" "}
                  </Route>
                                 {" "}
                </Routes>
                             {" "}
              </TaskProvider>
                         {" "}
            </NotificationProvider>
                     {" "}
          </AuthProvider>
                 {" "}
        </BrowserRouter>
             {" "}
      </ConfirmProvider>
         {" "}
    </ToastProvider>
  );
}
