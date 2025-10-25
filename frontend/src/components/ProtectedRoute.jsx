// frontend/src/components/ProtectedRoute.jsx
import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// FIX: AuthContext file extension ko .jsx mein badla gaya hai, jaisa ki yeh React Context file hai.
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation(); // ---------------------------- // Show loading spinner while auth state is loading // ----------------------------

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Centering items vertically
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Darker background for modern look
          backgroundColor: "#121212",
          color: "#ffffff", // Ensure text visibility if any
        }}
      >
                <CircularProgress size={60} sx={{ color: "#00f0ff" }} />       {" "}
        <Box sx={{ mt: 2, fontSize: "1.2rem", color: "#aaaaaa" }}>
                    Loading User Session...        {" "}
        </Box>
             {" "}
      </Box>
    );
  } // ---------------------------- // Redirect to /login if user is not authenticated // The 'state' is crucial for redirecting the user back to the page they wanted after successful login. // ----------------------------

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  } // ---------------------------- // Render children if user is authenticated // ----------------------------

  return children;
}
