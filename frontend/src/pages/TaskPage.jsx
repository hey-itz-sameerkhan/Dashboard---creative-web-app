// frontend/src/pages/TaskPage.jsx (FULLY MOBILE RESPONSIVE FIX + THEME FIXES)

import {
  Add,
  Cancel,
  Delete,
  Edit,
  NotificationsActive,
  Save,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme, // ✅ IMPORTED: Use theme for dynamic colors
} from "@mui/material";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
// ⭐ New Import: Use TaskContext for all task data and handlers
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";

export default function TaskPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const theme = useTheme(); // ✅ INITIALIZED THEME
  const isDark = theme.palette.mode === "dark";

  // Dynamic Colors based on Dark/Light Mode
  const dynamicColors = {
    // These colors match the dark theme in Dashboard.jsx
    KANBAN_COLUMN_BG: isDark ? "#1f2a40" : "#f4f5f7",
    TASK_CARD_BG: isDark ? "#121212" : theme.palette.background.paper,
    PAPER_BG: isDark ? "#1f2a40" : theme.palette.background.paper,
    PRIMARY_TEXT: theme.palette.text.primary,
    SECONDARY_TEXT: theme.palette.text.secondary,
    BORDER_COLOR: isDark ? "#2e3a50" : "#ddd",
  };

  // ⭐ ALL TASK STATE/HANDLERS COME FROM CONTEXT!
  const {
    tasks,
    loading,
    error,
    groupedTasks,
    STATUS_COLUMNS,
    handleAddTask: contextHandleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    highPriorityAlert,
    highPriorityTasks,
    handleCloseHighPriorityAlert,
  } = useTasks();

  // Local State for Adding New Task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    startDateTime: new Date().toISOString(),
    type: "Task",
  });

  // Local State for Editing
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});

  // 1. Add Handler calls Context
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      showToast("Task title cannot be empty.", "warning");
      return;
    }

    try {
      await contextHandleAddTask(newTask);
      setNewTask({
        title: "",
        description: "",
        status: "Pending",
        priority: "Medium",
        startDateTime: new Date().toISOString(),
        type: "Task",
      });
    } catch (err) {
      console.error("Failed to add task in TaskPage:", err);
    }
  };

  // 2. Status Change Handler calls Context
  const handleStatusChange = async (taskId, newStatus) => {
    await handleUpdateTask(taskId, { status: newStatus });
  };

  // 3. Edit Handlers call Context
  const startEdit = (task) => {
    setEditTaskId(task._id);
    setEditTaskData({
      ...task,
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      startDateTime: task.startDateTime || new Date().toISOString(),
      type: task.type || "Task",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editTaskData.title.trim()) {
      showToast("Task title cannot be empty.", "warning");
      return;
    }

    try {
      await handleUpdateTask(editTaskId, editTaskData);
      setEditTaskId(null);
    } catch (err) {
      console.error("Failed to save edit in TaskPage:", err);
    }
  };

  // Helper for Priority Styling (Unchanged logic, colors from theme)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return {
          bgcolor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        };
      case "Medium":
        // Fix: Use theme colors for medium priority text
        return {
          bgcolor: theme.palette.warning.main,
          color: isDark ? "black" : theme.palette.warning.contrastText,
        };
      case "Low":
      default:
        return {
          bgcolor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
        };
    }
  };

  // Task Card Component (Inner Card Fix)
  const TaskCard = ({ task }) => (
    <Card
      elevation={6}
      sx={{
        mb: 2,
        borderRadius: "10px",
        transition: "0.3s",
        // ✅ FIX 2: Dynamic Task Card Background
        bgcolor: dynamicColors.TASK_CARD_BG,
        color: dynamicColors.PRIMARY_TEXT,
        border: `1px solid ${dynamicColors.BORDER_COLOR}`,
        borderLeft: `6px solid ${
          task.status === "Completed"
            ? theme.palette.success.main
            : task.priority === "High"
            ? theme.palette.error.main
            : theme.palette.warning.main
        }`,
        opacity: task.status === "Completed" ? 0.9 : 1,
      }}
    >
      <CardContent>
        {editTaskId === task._id ? (
          // ... Edit form fields (No style changes needed here, MUI handles it)
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <TextField
              size="small"
              name="title"
              value={editTaskData.title}
              onChange={handleEditChange}
              label="Title"
              required
            />
            <TextField
              size="small"
              multiline
              minRows={2}
              name="description"
              value={editTaskData.description}
              onChange={handleEditChange}
              label="Description"
            />
            <FormControl size="small">
              <InputLabel id="edit-priority-label">Priority</InputLabel>
              <Select
                labelId="edit-priority-label"
                label="Priority"
                name="priority"
                value={editTaskData.priority}
                onChange={handleEditChange}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id="edit-status-label">Status</InputLabel>
              <Select
                labelId="edit-status-label"
                label="Status"
                name="status"
                value={editTaskData.status}
                onChange={handleEditChange}
              >
                {Object.entries(STATUS_COLUMNS).map(([key, column]) => (
                  <MenuItem key={key} value={key}>
                    {column.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveEdit}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => setEditTaskId(null)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  textDecoration:
                    task.status === "Completed" ? "line-through" : "none",
                  // Fix: Task Title Color Dynamic
                  color: dynamicColors.PRIMARY_TEXT,
                }}
              >
                {task.title}
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "15px",
                  ...getPriorityColor(task.priority),
                  typography: "caption",
                  fontWeight: "bold",
                  ml: 1,
                  flexShrink: 0,
                }}
              >
                {task.priority.toUpperCase()}
              </Box>
            </Box>
            <Typography
              variant="body2"
              color={dynamicColors.SECONDARY_TEXT} // Fix: Description Color Dynamic
              sx={{ mb: 2, minHeight: "40px" }}
            >
              {task.description || "No description provided."}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                pt: 1,
                borderTop: `1px solid ${dynamicColors.BORDER_COLOR}`, // Fix: Border Color Dynamic
              }}
            >
              {/* ✅ FIX: Status dropdown takes full width on extra small screens (xs) */}
              <FormControl size="small" sx={{ minWidth: 140, flexGrow: 1 }}>
                <InputLabel id={`status-label-${task._id}`}>Status</InputLabel>
                <Select
                  labelId={`status-label-${task._id}`}
                  label="Status"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  sx={{
                    fontWeight: "bold",
                    "& .MuiSelect-select": {
                      color: STATUS_COLUMNS[task.status]?.color,
                    },
                  }}
                >
                  {Object.entries(STATUS_COLUMNS).map(([key, column]) => (
                    <MenuItem key={key} value={key}>
                      {column.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  color="primary"
                  size="medium"
                  onClick={() => startEdit(task)}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  size="medium"
                  onClick={() => handleDeleteTask(task)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, p: 2 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        color={dynamicColors.PRIMARY_TEXT}
      >
        My Task Management 📋
      </Typography>
      <Typography
        variant="body1"
        color={dynamicColors.SECONDARY_TEXT}
        sx={{ mb: 3 }}
      >
        Hello, {user?.name || "User"}! Use the Status dropdown to update task
        status.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* High Priority Alert Modal (Fix 1: Background and Text Colors) */}
      <Modal open={highPriorityAlert} onClose={handleCloseHighPriorityAlert}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxWidth: "90%",
            // ✅ FIX 1: Modal Background to dark card color
            bgcolor: dynamicColors.PAPER_BG,
            color: dynamicColors.PRIMARY_TEXT,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: "none",
          }}
        >
          <Typography
            variant="h5"
            color="error"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <NotificationsActive /> Urgent Tasks Pending!
          </Typography>
          <Typography sx={{ mb: 2 }}>
            You have **{highPriorityTasks.length} high priority task(s)** that
            are not yet complete. Please address them urgently.
          </Typography>
          <List dense>
            {highPriorityTasks.map((task) => (
              <ListItem
                key={task._id}
                sx={{
                  // ✅ FIX 1: List Item Background to dark, less distracting color
                  bgcolor: isDark ? "#283850" : "#ffebee",
                  color: dynamicColors.PRIMARY_TEXT,
                  borderLeft: "3px solid red",
                  borderRadius: 1,
                  my: 0.5,
                }}
              >
                <ListItemText
                  primary={task.title}
                  // ✅ FIX 1: List Item secondary text color
                  primaryTypographyProps={{ color: dynamicColors.PRIMARY_TEXT }}
                  secondaryTypographyProps={{
                    color: dynamicColors.SECONDARY_TEXT,
                  }}
                  secondary={`Priority: ${task.priority.toUpperCase()} | Status: ${
                    STATUS_COLUMNS[task.status]?.title || task.status
                  }`}
                />
              </ListItem>
            ))}
          </List>
          <Button
            onClick={handleCloseHighPriorityAlert}
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 2 }}
          >
            I Understand (Snooze for 90 Minutes)
          </Button>
        </Box>
      </Modal>
      {/* 1. Add New Task Form (Container Fix) */}
      <Paper
        elevation={6}
        // ✅ FIX: Paper Background Dynamic
        sx={{
          p: 4,
          mb: 4,
          borderRadius: "12px",
          border: `1px solid ${dynamicColors.BORDER_COLOR}`,
          bgcolor: dynamicColors.PAPER_BG,
        }}
      >
        <Typography variant="h6" color="#orange" gutterBottom>
          Create New Task ➕
        </Typography>
        <Grid component="form" container spacing={3} onSubmit={handleAddTask}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Task Title"
              name="title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                name="priority"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Add />}
              sx={{ height: "40px", fontWeight: "bold" }}
            >
              Add Task
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* 2. Controls */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: dynamicColors.SECONDARY_TEXT, // Fix: Total Tasks Color
            display: "flex",
            alignItems: "center",
          }}
        >
          Total Tasks: {tasks.length}
        </Typography>
      </Box>
      {/* 3. KANBAN BOARD VIEW START (Column Fix) */}
      {tasks.length === 0 && !loading ? (
        <Alert severity="info">No tasks found. Add a new task above! 🚀</Alert>
      ) : (
        <Grid
          container
          spacing={4}
          // ✅ FIX FOR MOBILE: Removed wrap="nowrap" and overflowX: "auto"
          // This allows columns to wrap (stack vertically) on small screens.
        >
          {Object.entries(STATUS_COLUMNS).map(([statusKey, column]) => (
            <Grid
              item
              xs={12} // FULL WIDTH on extra small screens (Mobile)
              sm={6} // Half width on small screens (Tablet)
              md={4} // Third width on medium/desktop
              key={statusKey}
              // ✅ FIX FOR MOBILE: Removed sx={{ minWidth: 300 }}
            >
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  // ✅ FIX 2: Kanban Column Background Dynamic
                  backgroundColor: dynamicColors.KANBAN_COLUMN_BG,
                  color: dynamicColors.PRIMARY_TEXT,
                  borderRadius: "10px",
                  minHeight: "50vh",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: column.color,
                    borderBottom: `3px solid ${column.color}`,
                    pb: 1,
                  }}
                >
                  {column.title} ({groupedTasks[statusKey]?.length || 0})
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    maxHeight: "calc(100vh - 400px)", // Adjusted height for better mobile view
                    overflowY: "auto",
                  }}
                >
                  {groupedTasks[statusKey].map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                  {groupedTasks[statusKey].length === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        textAlign: "center",
                        // Fix: Empty Column Text Color
                        color: dynamicColors.SECONDARY_TEXT,
                        fontStyle: "italic",
                      }}
                    >
                      No tasks in this column. 🎉
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
