// frontend/src/components/AdminOnlyRoute.jsx
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminOnlyRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 🔹 Step 1: Wait until auth is fully loaded
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Checking admin access...</Typography>
      </Box>
    );
  }

  // 🔹 Step 2: If not logged in → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Step 3: If logged in but not admin → show access denied message
  if (user?.role !== "admin") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          p: 3,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Access Denied (403 Forbidden)
          </Alert>
          <Typography variant="h5" color="error" gutterBottom>
            Administrator Privileges Required
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sorry, your account doesn’t have administrator permissions to view
            this page.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // 🔹 Step 4: If admin → allow access
  return <Outlet />;
};

export default AdminOnlyRoute;
