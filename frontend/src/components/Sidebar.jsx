// frontend/src/components/Sidebar.jsx (MAXIMUM PADDING/SIZE FIX)

import {
  AccountCircle,
  AdminPanelSettings,
  BarChart,
  CalendarToday,
  Dashboard as DashboardIcon,
  ExitToApp,
  Group,
  Home as HomeIcon,
  Task,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFullImageUrl } from "../utils/image";

// --- Menu Definitions ---
const menuItems = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "My Tasks", icon: <Task />, path: "/tasks" },
  { text: "Analytics", icon: <BarChart />, path: "/charts" },
  { text: "Calendar", icon: <CalendarToday />, path: "/calendar" },
  { text: "Profile", icon: <AccountCircle />, path: "/account" },
];

const adminMenuItems = [
  { text: "Admin Dashboard", icon: <AdminPanelSettings />, path: "/admin" },
  { text: "User Management", icon: <Group />, path: "/admin/users" },
];

export default function Sidebar({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
}) {
  const { user, logout } = useAuth();
  const theme = useTheme();

  const userName = user?.name || "Guest";
  const userRole = user?.role?.toUpperCase() || "BASIC";
  const avatarSrc = getFullImageUrl(user?.profilePic);

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* 🌟 PROFILE HEADER: for Avatar Padding and Size */}
      <Box
        sx={{
          p: { xs: 9, sm: 7 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Avatar
          alt={userName}
          src={avatarSrc}
          sx={{
            // FIX 2: Increased Avatar size to 85px
            width: { xs: 85, sm: 80, md: 80 },
            height: { xs: 85, sm: 80, md: 80 },
            mb: 1.5, // Bottom margin भी थोड़ा बढ़ाया
            border: "3px solid white",
            fontSize: "2.2rem", // Font size बढ़ा दिया
            objectFit: "cover",
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" color="inherit" noWrap textAlign="center">
          {userName}
        </Typography>
        <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
          {userRole}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: theme.palette.divider }} />

      {/* 🧭 NAVIGATION & ADMIN TOOLS: Takes remaining space, handles scrolling */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {/* Main Navigation List */}
        <List sx={{ py: 0 }}>
          {menuItems.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                component={Link}
                to={path}
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* 🚨 ADMIN TOOLS: Inside the scrollable Box */}
        {user?.role === "admin" && (
          <>
            <Divider sx={{ my: 1, bgcolor: theme.palette.divider }} />
            <Typography
              variant="overline"
              sx={{ px: 2, color: theme.palette.text.secondary }}
            >
              ADMIN TOOLS
            </Typography>
            <List disablePadding>
              {adminMenuItems.map(({ text, icon, path }) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={path}
                    onClick={handleDrawerToggle}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <ListItemIcon sx={{ color: theme.palette.error.main }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>

      {/* 🚪 LOGOUT BUTTON: Positioned fixed at the absolute bottom */}
      <Divider sx={{ my: 1, bgcolor: theme.palette.divider }} />

      <List disablePadding sx={{ mb: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              logout();
              handleDrawerToggle();
            }}
          >
            <ListItemIcon>
              <ExitToApp color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                color: theme.palette.error.main,
                fontWeight: "bold",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="Sidebar navigation menu"
    >
      {/* 1️⃣ Temporary Drawer (Mobile View) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            // Width fix (Mobile only)
            width: { xs: "80%", sm: drawerWidth },
            maxWidth: 280,
            bgcolor: theme.palette.background.paper,
            height: "100vh",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 2️⃣ Permanent Drawer (Desktop View) - Unaffected */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
            height: "100vh",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
