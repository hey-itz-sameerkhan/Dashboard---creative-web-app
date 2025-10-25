// frontend/src/components/NotificationsBell.jsx (FINAL RESPONSIVE & DARK MODE FIXES)

import {
  AccountCircle,
  Category,
  Delete,
  DoneAll,
  EventNote,
  Notifications as NotificationsIcon,
  Task,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme, // ✅ IMPORTED for theme-aware colors
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo, useState } from "react";

import { useConfirm } from "../context/ConfirmContext";
import { useNotification } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";

// Initialize dayjs plugin
dayjs.extend(relativeTime);

// --- CONSTANTS ---
const FILTER_SOURCES = ["All", "Calendar", "Task", "Others"];

const snoozeCalendarReminder = (relatedId, minutes = 10) => {
  if (!relatedId) return;
  const snoozeUntil = dayjs().add(minutes, "minute").valueOf();
  localStorage.setItem(`snooze_${relatedId}`, snoozeUntil);
};

const getSourceColor = (source) => {
  switch (source) {
    case "Calendar":
      return { color: "primary", icon: <EventNote sx={{ fontSize: 16 }} /> };
    case "Task":
      return { color: "secondary", icon: <Task sx={{ fontSize: 16 }} /> };
    case "Profile":
      return {
        color: "warning",
        icon: <AccountCircle sx={{ fontSize: 16 }} />,
      };
    default:
      return { color: "default", icon: <Category sx={{ fontSize: 16 }} /> };
  }
};

// -----------------------------------------------------------
// Main Component
// -----------------------------------------------------------

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    handleMarkAllRead,
    handleMarkSingleRead,
    handleDeleteNotification,
    loadNotifications,
  } = useNotification();

  // ✅ USE THEME
  const theme = useTheme();

  const { confirm } = useConfirm() || {};
  const toast = useToast();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [hoveredNotificationId, setHoveredNotificationId] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedFilter(newValue);
  };

  const filteredNotifications = useMemo(() => {
    const filter = FILTER_SOURCES[selectedFilter];

    if (filter === "All") {
      return notifications.slice(0, 10);
    }

    const explicitSources = ["Calendar", "Task"];

    if (explicitSources.includes(filter)) {
      return notifications.filter((n) => n.source === filter).slice(0, 10);
    }

    if (filter === "Others") {
      return notifications
        .filter((n) => !explicitSources.includes(n.source))
        .slice(0, 10);
    }

    return notifications.slice(0, 10);
  }, [notifications, selectedFilter]);

  const handleSnooze = (notificationId, relatedId) => {
    if (!relatedId) return;

    snoozeCalendarReminder(relatedId, 10);
    handleMarkSingleRead(notificationId);
    if (toast && typeof toast.info === "function") {
      toast.info("Notification snoozed for 10 minutes.");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (
      notification.relatedId &&
      (notification.source === "Task" || notification.source === "Calendar")
    ) {
      console.log(
        `Intended navigation to ${notification.source} ID: ${notification.relatedId}`
      );
    }

    if (!notification.read) {
      await handleMarkSingleRead(notification._id);
    }
  };

  /**
   * Delete Handler
   */
  const handleDelete = async (e, notification) => {
    e.stopPropagation();

    if (!confirm || typeof confirm !== "function") {
      console.error(
        "The confirm function is not available or is not callable."
      );
      if (toast && typeof toast.error === "function") {
        toast.error("Error: Confirmation service failed to load.");
      }
      return;
    }

    const showToastError = (message) => {
      if (toast && typeof toast.error === "function") {
        toast.error(message);
      } else {
        console.error(`Toast Error: ${message}`);
      }
    };

    const showToastSuccess = (message) => {
      if (toast && typeof toast.success === "function") {
        toast.success(message);
      } else {
        console.log(`Toast Success: ${message}`);
      }
    };

    const isConfirmed = await confirm({
      title: "Confirm Delete",
      message: `Are you sure you want to permanently delete the notification: "${notification.message.substring(
        0,
        30
      )}..."?`,
      confirmText: "Delete",
      color: "error",
    });

    if (isConfirmed) {
      try {
        await handleDeleteNotification(notification._id);
        showToastSuccess("Notification deleted successfully!");
        setHoveredNotificationId(null);
      } catch (error) {
        console.error("Deletion failed:", error);
        showToastError("Failed to delete notification. Check server logs.");
        loadNotifications();
      }
    }
  };

  /**
   * Mark Single Read Handler
   */
  const handleMarkReadClick = async (e, notificationId) => {
    e.stopPropagation();
    await handleMarkSingleRead(notificationId);
    setHoveredNotificationId(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notifications-popover" : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          color: "inherit",
          borderRadius: 1,
          transition: "background-color 0.3s, transform 0.2s",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            transform: "scale(1.05)",
            color: "white",
          },
          "&.Mui-focusVisible": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              borderRadius: 2,
              // ✅ RESPONSIVE FIX: Min/Max width for mobile
              minWidth: { xs: 300, sm: 350 },
              maxWidth: { xs: "90vw", sm: 420 }, // 90% of screen on small devices
            },
          },
        }}
      >
        <Box sx={{ width: "100%", maxHeight: 600, overflowY: "auto" }}>
          {/* Header Box... */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6">Notifications</Typography>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                startIcon={<DoneAll />}
                onClick={handleMarkAllRead}
                size="small"
                sx={{ ml: 1, textTransform: "none" }}
              >
                Mark All Read
              </Button>
            )}
          </Box>
          <Divider />
          {/* Tabs Box... */}
          <Tabs
            value={selectedFilter}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="notification source tabs"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {FILTER_SOURCES.map((source, index) => (
              <Tab
                key={source}
                label={source}
                icon={
                  source === "All"
                    ? null
                    : getSourceColor(source).icon || (
                        <Category sx={{ fontSize: 16 }} />
                      )
                }
                iconPosition="start"
                sx={{ minWidth: 75, p: 0.5 }}
              />
            ))}
          </Tabs>

          <List dense disablePadding>
            {filteredNotifications.length === 0 ? (
              <ListItem sx={{ p: 2 }}>
                <ListItemText
                  primary={`No ${FILTER_SOURCES[selectedFilter]} notifications found.`}
                  sx={{ textAlign: "center" }}
                />
              </ListItem>
            ) : (
              filteredNotifications.map((notification) => {
                const sourceProps = getSourceColor(notification.source);
                const isCalendarReminder =
                  notification.source === "Calendar" &&
                  notification.type === "warning" &&
                  notification.relatedId;

                const isHovered = hoveredNotificationId === notification._id;

                // 🎯 DARK MODE/READ STATE FIX
                // Determine background color based on read status and theme mode
                const unreadBg =
                  theme.palette.mode === "dark"
                    ? "rgba(25, 118, 210, 0.1)"
                    : theme.palette.primary.light;
                const unreadHoverBg =
                  theme.palette.mode === "dark"
                    ? "rgba(25, 118, 210, 0.2)"
                    : theme.palette.primary.lighter;
                const readHoverBg =
                  theme.palette.mode === "dark"
                    ? theme.palette.action.hover
                    : "#f0f0f0";

                return (
                  <ListItem
                    key={notification._id}
                    divider
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={() =>
                      setHoveredNotificationId(notification._id)
                    }
                    onMouseLeave={() => setHoveredNotificationId(null)}
                    sx={{
                      // ✅ FIX: Use theme-aware background colors
                      backgroundColor: notification.read
                        ? "transparent" // Let the Paper background show
                        : unreadBg,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      py: 1.5,
                      px: 2,
                      "&:hover": {
                        backgroundColor: notification.read
                          ? readHoverBg
                          : unreadHoverBg,
                      },
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Top Row: Chip and Message */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        mb: 0.5,
                      }}
                    >
                      {/* Source Chip */}
                      <Chip
                        label={notification.source || "General"}
                        size="small"
                        color={sourceProps.color}
                        icon={sourceProps.icon}
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          mr: 1.5,
                          minWidth: 70,
                          alignSelf: "flex-start",
                          mt: "2px",
                        }}
                      />

                      {/* Main Message (Takes remaining space) */}
                      <ListItemText
                        primary={notification.message}
                        primaryTypographyProps={{
                          fontWeight: notification.read ? "normal" : "600",
                          fontSize: "0.9rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                          margin: 0,
                          padding: 0,
                        }}
                        sx={{
                          minWidth: 0,
                          flexGrow: 1,
                          flexShrink: 1,
                          mr: 1,
                        }}
                      />
                    </Box>

                    {/* Bottom Row: Time Ago and Actions (Snooze/Delete/MarkRead) */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center",
                        pr: 0,
                        mt: 0.5,
                        pl: 0,
                      }}
                    >
                      {/* Left Side: Time Ago / Snooze */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {isCalendarReminder && !notification.read && (
                          <Button
                            size="small"
                            color="secondary"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSnooze(
                                notification._id,
                                notification.relatedId
                              );
                            }}
                            sx={{
                              mr: 2,
                              fontSize: "0.7rem",
                              p: "2px 8px",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                backgroundColor:
                                  theme.palette.mode === "dark"
                                    ? "secondary.dark"
                                    : "secondary.light", // Theme-aware hover color
                              },
                            }}
                          >
                            Snooze 10m
                          </Button>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          {dayjs(notification.createdAt).fromNow()}
                        </Typography>
                      </Box>

                      {/* Right Side: In-line Actions (only visible on hover) */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          opacity: isHovered ? 1 : 0,
                          transition: "opacity 0.2s",
                          ml: 2,
                        }}
                      >
                        {/* ✅ Mark as Read Button (Show only if UNREAD) */}
                        {!notification.read && (
                          <Tooltip title="Mark as Read">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) =>
                                handleMarkReadClick(e, notification._id)
                              }
                            >
                              <VisibilityOff sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* ✅ Delete Button */}
                        <Tooltip title="Delete Notification">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => handleDelete(e, notification)}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ListItem>
                );
              })
            )}
          </List>

          <Divider />

          <Box sx={{ p: 1, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Showing the latest 10 filtered notifications.
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
