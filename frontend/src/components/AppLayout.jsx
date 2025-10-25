// frontend/src/components/AppLayout.jsx - PROPER SCROLL FIX

import { Menu as MenuIcon } from "@mui/icons-material";
// ★★★ NEW IMPORT: Icons for Dark/Light Mode ★★★
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Moon Icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Sun Icon
import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ★★★ NEW IMPORT: useColorMode hook (from the file we just created) ★★★
import { useColorMode } from "../context/ColorModeContext";
import { getFullImageUrl } from "../utils/image";
import NotificationsBell from "./NotificationsBell";
import Sidebar from "./Sidebar";

// Sidebar width constant
const drawerWidth = 240;

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const theme = useTheme();

  // ★★★ NEW: Color Mode Context से mode और toggle फ़ंक्शन लें ★★★
  const { toggleColorMode } = useColorMode();
  // theme.palette.mode का उपयोग करें ताकि हमें पता चले कि वर्तमान में कौन सा मोड सक्रिय है
  const currentMode = theme.palette.mode;
  // ★★★ NEW END ★★★

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getFirstName = () => {
    const fullName = user?.name?.trim() || "";
    return fullName.split(" ")[0] || "User";
  };

  // ... (isLoading और !user चेक अपरिवर्तित)

  if (isLoading) {
    // ... (Loading Screen)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <CircularProgress size={50} />{" "}
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <CssBaseline /> {/* 🌟 TOP NAVBAR (Fixed position) */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          // NOTE: Background color ab theme.palette.primary.main se aayega
          // Dark Mode mein, yeh color aapke dark theme object se aayega!
          // yahan koi change ki zaroorat nahi.
          backgroundColor: theme.palette.primary.main,
          boxShadow: { sm: "none" },
          borderBottom: { sm: "none" },
          color: "white",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />{" "}
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Welcome, {getFirstName()}!{" "}
          </Typography>
          {/* ★★★ NEW: Dark Mode Toggle Button ★★★ */}
          <IconButton
            sx={{ ml: 1 }}
            onClick={toggleColorMode}
            color="inherit"
            title={
              currentMode === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            {/* mode के आधार पर icon बदलें */}
            {currentMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {/* ★★★ NEW END ★★★ */}
          <NotificationsBell />{" "}
          <Avatar
            alt={user.name || "User"}
            src={getFullImageUrl(user.profilePic)}
            sx={{
              ml: 2,
              // NOTE: Dark Mode mein secondary.main bhi dark theme se aayega
              bgcolor: "secondary.main",
              width: 40,
              height: 40,
            }}
          />
        </Toolbar>
      </AppBar>
      {/* 🌟 SIDEBAR (Unchanged) */}
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          "& > div": {
            pt: (theme) => `${theme.mixins.toolbar.minHeight}px`,
            height: "100%",
          },
        }}
      >
        <Sidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
      </Box>
      {/* 🌟 MAIN CONTENT - अंतिम और मज़बूत फिक्स */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: 3,
        }}
      >
        <Toolbar />{" "}
        <Box
          sx={{
            height: "calc(100vh - 64px - 24px - 24px)",
            overflowY: "auto",
          }}
        >
          <Outlet />{" "}
        </Box>
      </Box>
    </Box>
  );
}
