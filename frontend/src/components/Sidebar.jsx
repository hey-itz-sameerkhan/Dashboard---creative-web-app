// frontend/src/components/Sidebar.jsx (COMPLETE UPDATED CODE)

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

// --- Static Menu Definitions ---
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
    // FIX 2: Added flexGrow: 1 to the main Box container to ensure it fills 100% height
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Ensures the container uses the full height of the Drawer
        // FIX 3: Optional scroll if content still exceeds screen height
        // overflowY: 'auto' is managed by the main list for a better look
      }}
    >
      {/* 🌟 PROFILE HEADER: Fixed Vertical Padding for small screens */}
      <Box
        sx={{
          // Increased vertical padding (p: 2 is 16px, p: 10 was too large, p: 3 is 24px)
          p: { xs: 2, sm: 2 },
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
            width: { xs: 56, sm: 64, md: 70 },
            height: { xs: 56, sm: 64, md: 70 },
            mb: 1,
            border: "2px solid white",
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            objectFit: "cover",
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography
          variant="h6"
          color="inherit"
          noWrap
          textAlign="center"
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            maxWidth: 140,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {userName}
        </Typography>
        <Typography
          variant="caption"
          color="inherit"
          sx={{
            opacity: 0.8,
            textAlign: "center",
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
          }}
        >
          {userRole}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: theme.palette.divider }} />

      {/* 🧭 MAIN NAVIGATION LIST: Takes up remaining space and handles scrolling */}
      {/* FIX 3: flexGrow: 1 ensures the list expands to push the footer/logout button down */}
      <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
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

        {/* Admin Tools Section is kept within the scrollable list area */}
        {user?.role === "admin" && (
          <>
            <Divider sx={{ my: 1, bgcolor: theme.palette.divider }} />
            <Typography
              variant="overline"
              sx={{ px: 2, color: theme.palette.text.secondary }}
            >
              Admin Tools
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
      </List>

      {/* 🚪 LOGOUT BUTTON: Positioned fixed at the bottom (outside the scrollable main list) */}
      <Divider sx={{ my: 1, bgcolor: theme.palette.divider }} />

      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              logout();
              handleDrawerToggle();
            }}
          >
            <ListItemIcon>
              {/* Using MUI's built-in error color for visibility */}
              <ExitToApp color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              // FIX 4: Ensured the Logout text color is highly visible against the background (using error.main)
              primaryTypographyProps={{ color: theme.palette.error.main }}
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
            // FIX 1: Set width to 80% of viewport, but max 280px
            width: { xs: "80%", sm: drawerWidth },
            maxWidth: 280,
            bgcolor: theme.palette.background.paper,
            height: "100vh",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 2️⃣ Permanent Drawer (Desktop View) */}
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
