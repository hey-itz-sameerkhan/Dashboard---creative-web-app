// frontend/src/pages/AdminUserManagement.jsx

import { Delete, Security, Task } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card, // ✅ NEW: Card for mobile
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, // ✅ NEW: List
  Divider,
  IconButton, // ✅ NEW: CardContent
  List,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// DataGrid अब केवल डेस्कटॉप/टैबलेट के लिए उपयोग होगा
import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { deleteUser, fetchAllUsers, updateUserRole } from "../utils/api.js";

// Helper: Map _id to id for DataGrid safely
const mapUsersForGrid = (data) =>
  data.map((user) => ({
    id: user._id,
    name: user.name || "Unknown",
    email: user.email || "N/A",
    role: user.role || "basic",
    totalTasks: user.totalTasks || 0,
    authProvider: user.authProvider || "local",
    createdAt: user.createdAt || null,
  }));

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const theme = useTheme();
  // 'sm' (600px) से नीचे की स्क्रीन के लिए
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // 'md' (900px) से नीचे की स्क्रीन के लिए
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const isAdmin = user?.role === "admin";

  // ✅ Delete Confirmation Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // ✅ Load Users (UNCHANGED)
  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(mapUsersForGrid(data));
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err?.message || "Failed to load users from server.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ✅ Handle Role Change (UNCHANGED)
  const handleRoleChange = async (userId, newRole) => {
    if (userId === user?._id) {
      // Use alert for consistency, although a custom modal is better
      alert("You cannot change your own role!");
      return;
    }

    const originalUsers = [...users];
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);

    try {
      await updateUserRole(userId, newRole);
      setSuccessMessage(`Role updated to ${newRole.toUpperCase()}.`);
    } catch (err) {
      console.error("Role update failed:", err);
      setUsers(originalUsers);
      setError(err?.message || "Failed to update role.");
    }
  };

  // ✅ Open Delete Dialog (UNCHANGED)
  const openDeleteDialog = (user) => {
    if (user.id === user?._id) return; // cannot delete self
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // ✅ Confirm Delete (UNCHANGED)
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setError(null);
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccessMessage(`User "${userToDelete.name}" deleted successfully.`);
    } catch (err) {
      console.error("Delete Error:", err);
      setError(err?.message || "Failed to delete user.");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // ✅ DataGrid Columns (Desktop/Tablet View) - अब ये सिर्फ बड़ी स्क्रीन के लिए है
  const columns = useMemo(() => {
    return [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        minWidth: 150,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1, // बची हुई जगह का उपयोग करें
        minWidth: 200,
        renderCell: (params) => (
          <Tooltip title={params.value}>
            <span>{params.value}</span>
          </Tooltip>
        ),
      },
      // totalTasks, authProvider और createdAt को छोटे डेस्कटॉप/टैबलेट पर छिपा दें
      ...(!isTablet
        ? [
            {
              field: "totalTasks",
              headerName: "Tasks",
              width: 100,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  icon={<Task fontSize="small" />}
                  color={params.value > 0 ? "info" : "default"}
                  variant="outlined"
                />
              ),
            },
            {
              field: "authProvider",
              headerName: "Auth",
              width: 90,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  icon={
                    params.value === "google" ? (
                      <Security fontSize="small" />
                    ) : undefined
                  }
                  color={params.value === "google" ? "primary" : "default"}
                  variant="outlined"
                />
              ),
            },
            {
              field: "createdAt",
              headerName: "Joined",
              width: 140,
              valueGetter: (params) => {
                const dateValue = params.row?.createdAt;
                if (!dateValue) return "N/A";
                const date = new Date(dateValue);
                return isNaN(date.getTime())
                  ? "Invalid Date"
                  : date.toLocaleDateString();
              },
            },
          ]
        : []),
      {
        field: "role",
        headerName: "Role",
        width: 150,
        minWidth: 120,
        renderCell: (params) => (
          <Select
            value={params.value}
            onChange={(e) => handleRoleChange(params.row.id, e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: 120, fontSize: 13 }}
            disabled={params.row.id === user?._id}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="basic">Basic</MenuItem>
          </Select>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        minWidth: 80,
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="Delete User">
            <span>
              <IconButton
                color="error"
                size="small"
                disabled={params.row.id === user?._id}
                onClick={() => openDeleteDialog(params.row)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ),
      },
    ];
  }, [isTablet, user]);

  // ✅ UI Rendering
  if (!isAdmin) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        Access Denied. You must be an administrator to view this page.
      </Alert>
    );
  }

  // Common loading/error checks
  const statusContent = loading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: 400,
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  ) : !users?.length ? (
    <Alert severity="info" sx={{ mt: 2 }}>
      No users found in the system.
    </Alert>
  ) : null;

  return (
    <Box sx={{ mt: 3, p: isMobile ? 1 : 2 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View, update roles, and manage all user accounts.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {statusContent}

      {/* ✅ CONDITIONAL RENDERING: Mobile Card View vs Desktop DataGrid */}
      {!loading && users?.length > 0 && (
        <>
          {isMobile ? (
            // --- 📱 MOBILE CARD VIEW ---
            <List sx={{ p: 0 }}>
              {users.map((row, index) => (
                <Card
                  key={row.id}
                  sx={{
                    mb: 2,
                    boxShadow: 3,
                    borderRadius: 2,
                    // Admin को दिखाने के लिए बाएं किनारे पर रंगीन पट्टी
                    borderLeft: `5px solid ${
                      row.role === "admin"
                        ? theme.palette.primary.main
                        : theme.palette.info.main
                    }`,
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {/* User Name and Auth Type */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1.5}
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        pb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: "bold" }}
                      >
                        {row.name}
                      </Typography>
                      <Chip
                        label={row.authProvider}
                        size="small"
                        icon={
                          row.authProvider === "google" ? (
                            <Security fontSize="small" />
                          ) : undefined
                        }
                        color={
                          row.authProvider === "google" ? "primary" : "default"
                        }
                        variant="outlined"
                      />
                    </Box>

                    {/* Email, Tasks, and Joined Date */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        <span style={{ fontWeight: 600 }}>Email: </span>
                        {row.email}
                      </Typography>
                      <Chip
                        label={`${row.totalTasks} Tasks`}
                        size="small"
                        icon={<Task fontSize="small" />}
                        color={row.totalTasks > 0 ? "info" : "default"}
                        variant="outlined"
                        sx={{ mt: 1, height: 24, mr: 1 }}
                      />
                      <Chip
                        label={`Joined: ${new Date(
                          row.createdAt
                        ).toLocaleDateString()}`}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ mt: 1, height: 24 }}
                      />
                    </Box>

                    {/* Role Change and Actions */}
                    <Divider sx={{ my: 1.5 }} />

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" flexDirection="column">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          gutterBottom
                        >
                          Change Role:
                        </Typography>
                        <Select
                          value={row.role}
                          onChange={(e) =>
                            handleRoleChange(row.id, e.target.value)
                          }
                          variant="outlined"
                          size="small"
                          sx={{ width: 100, fontSize: 13 }}
                          disabled={row.id === user?._id}
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="basic">Basic</MenuItem>
                        </Select>
                      </Box>

                      {/* Delete Button */}
                      <Tooltip title="Delete User">
                        <span>
                          <IconButton
                            color="error"
                            size="large"
                            disabled={row.id === user?._id}
                            onClick={() => openDeleteDialog(row)}
                          >
                            <Delete fontSize="medium" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            // --- 🖥️ DESKTOP DATAGRID VIEW ---
            <Box
              sx={{
                height: 600,
                width: "100%",
                bgcolor: "background.paper",
                boxShadow: 3,
              }}
            >
              <DataGrid
                rows={users}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                  sorting: {
                    sortModel: [{ field: "createdAt", sort: "desc" }],
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
              />
            </Box>
          )}
        </>
      )}

      {/* ✅ Delete Confirmation Dialog (UNCHANGED) */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete user{" "}
          <strong>{userToDelete?.name}</strong>? This will remove all their
          data.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
