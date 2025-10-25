// frontend/src/pages/CalendarPage.jsx (FINAL FIX for Consistency & Mobile Responsiveness)

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // For Week/Day Time Slots
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
  useMediaQuery, // <<< NEW IMPORT
  useTheme, // <<< NEW IMPORT
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
// 🎯 Import dayjs for date manipulation
import dayjs from "dayjs";
// dayjs plugin for checking if a date is the same or after another (needed for future checks)
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

import { useNotification } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";
import { addTask, fetchTaskById, fetchTasks, updateTask } from "../utils/api";

// --- CONSTANTS & HELPERS ---
const REMINDER_PRE_TIME_MINUTES = 10; // Remind 10 minutes before the event starts
const POLLING_INTERVAL_MS = 60000; // Check reminders every 60 seconds (1 minute)
const NIGHT_BEFORE_HOUR = 21; // 9 PM for night-before reminder

// Helper to check snooze status from Local Storage
const isTaskSnoozed = (taskId) => {
  const snoozeUntil = localStorage.getItem(`snooze_${taskId}`);
  if (!snoozeUntil) return false; // Check if the snooze time has passed
  return dayjs().isBefore(dayjs(Number(snoozeUntil)));
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const TODAY_DATE_STRING = getTodayDateString();

// -----------------------------------------------------------
// 1. Data Transformer: Task to Calendar Event
// -----------------------------------------------------------
const transformTasksToEvents = (tasks) => {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .filter((task) => task.startDateTime)
    .map((task) => {
      let backgroundColor = "#3f51b5";
      let isCompleted = task.status === "Completed";
      let textColor = "white";

      if (isCompleted) {
        backgroundColor = "#4caf50";
      } else if (task.priority === "High") {
        backgroundColor = "#f44336";
      } else if (task.priority === "Medium") {
        backgroundColor = "#ff9800";
      }

      return {
        id: task._id,
        title: task.title,
        start: task.startDateTime,
        end: task.endDateTime || null,
        allDay: !task.endDateTime || false,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        textColor: textColor,
        extendedProps: {
          ...task,
          isCompleted: isCompleted,
        },
      };
    });
};

// -----------------------------------------------------------
// 2. Task/Event DETAIL & EDIT Modal
// -----------------------------------------------------------

function TaskDetailModal({ open, handleClose, taskId, onTaskUpdated }) {
  const { showToast } = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // 🔥 NEW: Check for mobile screen
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // 🔥 NEW END

  useEffect(() => {
    const loadTaskDetails = async () => {
      if (!taskId || !open) return;
      setLoading(true);
      try {
        const fetchedTask = await fetchTaskById(taskId);
        setTask(fetchedTask);
        setFormData({
          title: fetchedTask.title,
          description: fetchedTask.description,
          status: fetchedTask.status,
          priority: fetchedTask.priority,
        });
        setIsEditing(false);
      } catch (error) {
        showToast("Failed to load task details.", "error");
        console.error("Fetch detail error:", error);
        handleClose();
      } finally {
        setLoading(false);
      }
    };
    loadTaskDetails();
  }, [taskId, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Backend handles status change notifications for general updateTask call
      await updateTask(taskId, formData);
      showToast("Task updated successfully!", "success");
      onTaskUpdated();
      setIsEditing(false);
      handleClose();
    } catch (error) {
      showToast(
        `Failed to update task: ${error.message || "Server error"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    setLoading(true);
    try {
      // Use general updateTask, assuming the backend handles status updates correctly
      await updateTask(taskId, { status: newStatus });
      showToast(`Task marked as ${newStatus}!`, "success");
      onTaskUpdated();
      handleClose();
    } catch (error) {
      showToast(`Failed to update status.`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !task) {
    return (
      <Dialog open={open} onClose={handleClose} fullScreen={isMobile}>
        {" "}
        {/* 🔥 NEW: fullScreen for mobile */}
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  const isCompleted = task.status === "Completed";
  const taskDate = task.startDateTime
    ? new Date(task.startDateTime).toLocaleString()
    : "N/A";

  return (
    // 🔥 NEW: fullScreen for mobile
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        {isCompleted && (
          <CheckCircleIcon
            sx={{ verticalAlign: "middle", mr: 1, color: "green" }}
          />
        )}
        <span style={{ textDecoration: isCompleted ? "line-through" : "none" }}>
          {task.title}
        </span>
      </DialogTitle>
      <DialogContent dividers>
        {isEditing ? (
          // --- EDIT FORM VIEW ---
          <Grid container spacing={2}>
            {/* Grid item xs={12} is already mobile responsive */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            {/* Priority: xs={12} for mobile, sm={6} for desktop */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                SelectProps={{ native: true }}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </TextField>
            </Grid>
            {/* Status: xs={12} for mobile, sm={6} for desktop */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                SelectProps={{ native: true }}
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </TextField>
            </Grid>
          </Grid>
        ) : (
          // --- DETAIL VIEW ---
          <Box>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Date/Time:</strong> {taskDate}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Priority:</strong> {task.priority}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Status:</strong> {task.status}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Type:</strong> {task.type || "Task"}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Description:</strong>
              {task.description || "No description provided."}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Created by: {task.createdBy?.name || "N/A"}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {/* Toggle Status Button */}
        {!isEditing && (
          <Button
            onClick={handleToggleStatus}
            color={isCompleted ? "secondary" : "success"}
            disabled={loading}
          >
            {isCompleted ? "Mark Pending" : "Mark Completed"}
          </Button>
        )}
        {/* Edit/Cancel Edit Button */}
        <Button
          onClick={() => setIsEditing(!isEditing)}
          color="primary"
          disabled={loading}
        >
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button>
        {/* Save Changes Button */}
        {isEditing && (
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            Save Changes
          </Button>
        )}
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// -----------------------------------------------------------
// 3. Task Creation Modal Component
// -----------------------------------------------------------

function TaskCreationModal({ open, handleClose, initialDate, onTaskCreated }) {
  const { showToast } = useToast();
  const { addAppNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const minDate = TODAY_DATE_STRING;

  // 🔥 NEW: Check for mobile screen
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // 🔥 NEW END

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    type: "Task",
    startDateTime: initialDate,
    startTime: "09:00",
    endTime: "10:00",
  });

  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({ ...prev, startDateTime: initialDate }));
    }
  }, [initialDate, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      title,
      startDateTime,
      startTime,
      endTime,
      status,
      priority,
      description,
      type,
    } = formData;

    const finalStartDateTime = `${startDateTime}T${startTime}:00`;
    const finalEndDateTime = endTime ? `${startDateTime}T${endTime}:00` : null;

    try {
      if (!title || !startDateTime || !startTime || !type) {
        throw new Error("Title, Date, Start Time, and Type are required.");
      }

      if (finalEndDateTime && finalEndDateTime <= finalStartDateTime) {
        throw new Error("End Time must be after Start Time.");
      }

      const newTask = await addTask({
        title,
        description,
        status,
        priority,
        type, // The backend handles the startDateTime and endDateTime for scheduling
        startDateTime: finalStartDateTime,
        endDateTime: finalEndDateTime,
      });

      showToast(`${type} created successfully!`, "success");
      onTaskCreated(); // Trigger data reload in CalendarPage
      handleClose(); // Add Calendar notification after successful creation

      addAppNotification(
        "info",
        `New ${type} added: "${title}" on ${new Date(
          finalStartDateTime
        ).toLocaleDateString()}`,
        newTask._id,
        "Calendar" // Set the source
      ); // Reset form to initial state for next use

      setFormData((prev) => ({
        title: "",
        description: "",
        status: "Pending",
        priority: "Medium",
        type: "Task",
        startDateTime: initialDate,
        startTime: "09:00",
        endTime: "10:00",
      }));
    } catch (error) {
      console.error("Task creation error:", error);
      showToast(
        `Failed to create task: ${error.message || "Server Error"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔥 NEW: fullScreen for mobile
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>Add New Task/Event</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* All TextFields are already fullWidth on all screens (xs={12}) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            {/* Time Slot Inputs: xs={12} for mobile, sm={4} for desktop */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                name="startDateTime"
                type="date"
                value={formData.startDateTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: minDate }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Time (Optional)"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* Other Metadata: xs={12} for mobile, sm={6} for desktop */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                SelectProps={{ native: true }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                SelectProps={{ native: true }}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                SelectProps={{ native: true }}
              >
                <option value="Task">Task</option>
                <option value="Event">Event</option>
                <option value="Meeting">Meeting</option>
                <option value="Reminder">Reminder</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading || !formData.title || !formData.startDateTime}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Save Task"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// -----------------------------------------------------------
// 4. Custom Hook for Smart Reminder Logic (Unchanged)
// -----------------------------------------------------------
// ... (useReminderScheduler component is UNCHANGED as it's not visual)
/**
 * Custom Hook to handle all calendar reminder logic.
 * It periodically checks pending tasks and alerts the user.
 */
const useReminderScheduler = (tasks) => {
  const { showToast } = useToast();
  const { addAppNotification } = useNotification(); // State to track which task reminders have already been sent in the current session

  const [remindedTasks, setRemindedTasks] = useState({}); // Function to check if reminder is due

  const checkForReminders = useCallback(() => {
    const now = dayjs(); // Calculate 9 PM today
    const nightBeforeTime = dayjs().hour(NIGHT_BEFORE_HOUR).minute(0).second(0);
    const todayDay = now.startOf("day");

    tasks.forEach((task) => {
      // 1. Basic Checks
      if (task.status === "Completed") return; // Skip completed tasks
      if (isTaskSnoozed(task._id)) return; // Skip snoozed tasks

      const startDayjs = dayjs(task.startDateTime);
      const taskId = task._id;
      const taskStartDay = startDayjs.startOf("day"); // --- A. Night-Before Reminder Logic (E.g., 9 PM the night before) ---

      const nightReminderKey = `${taskId}_night`; // 🎯 FIXED LOGIC: Ensures task is for TOMORROW and the current time is in the 9PM+ window.

      const isTaskTomorrow = taskStartDay.isSame(todayDay.add(1, "day"), "day");
      const isNightWindowOpen = now.isAfter(nightBeforeTime);

      const isNightReminderDue =
        isTaskTomorrow && // The event must be tomorrow
        isNightWindowOpen && // It must be the night window (e.g., after 9 PM today)
        !remindedTasks[nightReminderKey];

      if (isNightReminderDue) {
        const nightMessage = `Heads up! Your ${task.type} "${
          task.title
        }" is scheduled for TOMORROW at ${startDayjs.format("h:mm A")}!`; // Send Alert

        showToast(nightMessage, "warning");
        addAppNotification("warning", nightMessage, taskId, "Calendar"); // Mark as reminded

        setRemindedTasks((prev) => ({ ...prev, [nightReminderKey]: true }));
        return; // Don't check for 'time' reminder if 'night' is sent
      } // --- B. Just-in-Time Reminder Logic (E.g., 10 minutes before) ---

      const timeReminder = startDayjs.subtract(
        REMINDER_PRE_TIME_MINUTES,
        "minute"
      );
      const timeReminderKey = `${taskId}_time`; // Check if: // 1. The current time is past the reminder threshold. // 2. The current time is before the actual start time. // 3. We haven't sent the time reminder yet in this session.

      const isTimeReminderDue =
        now.isAfter(timeReminder) &&
        now.isBefore(startDayjs) &&
        !remindedTasks[timeReminderKey];

      if (isTimeReminderDue) {
        const timeUntilStart = Math.ceil(startDayjs.diff(now, "minute")); // Time in minutes
        const timeMessage = `${task.type} Reminder: "${
          task.title
        }" starts in ${timeUntilStart} minutes at ${startDayjs.format(
          "h:mm A"
        )}!`; // Send Alert

        showToast(timeMessage, "warning");
        addAppNotification("warning", timeMessage, taskId, "Calendar"); // Mark as reminded

        setRemindedTasks((prev) => ({ ...prev, [timeReminderKey]: true }));
      }
    });
  }, [tasks, showToast, addAppNotification, remindedTasks]); // Set up the Polling Interval

  useEffect(() => {
    // Run an initial check on mount
    checkForReminders();

    const intervalId = setInterval(() => {
      // The interval should only check reminders
      checkForReminders();
    }, POLLING_INTERVAL_MS); // Check every 60 seconds (1 minute)

    return () => clearInterval(intervalId);
  }, [checkForReminders]);
};

// -----------------------------------------------------------
// 5. Main Calendar Component
// -----------------------------------------------------------

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { showToast } = useToast();

  // 🔥 NEW: Check for mobile screen
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // 🔥 NEW END

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetchTasks();
      setTasks(response);
    } catch (err) {
      console.error("Error fetching tasks for calendar:", err);
      showToast("Failed to load calendar data.", "error");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []); // Integrate the Custom Reminder Hook

  useReminderScheduler(tasks);

  const calendarEvents = useMemo(() => transformTasksToEvents(tasks), [tasks]);

  const handleDateClick = (dateInfo) => {
    const clickedDate = dateInfo.dateStr.split("T")[0]; // Set the selected date and open the creation modal

    setSelectedDate(clickedDate);
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedTaskId(clickInfo.event.id);
    setDetailModalOpen(true);
  };

  const handleEventDrop = async (eventDropInfo) => {
    const { event } = eventDropInfo;
    const taskId = event.id;

    const newStart = event.startStr;
    const newEnd = event.endStr;

    try {
      await updateTask(taskId, {
        startDateTime: newStart,
        endDateTime: newEnd || null,
      });

      showToast("Task successfully rescheduled!", "success"); // Re-load tasks to update the underlying state and trigger new reminder checks
      await loadTasks();
    } catch (error) {
      showToast("Failed to reschedule task.", "error");
      console.error("Reschedule error:", error);
      eventDropInfo.revert();
    }
  };

  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];

  // 🔥 NEW: FullCalendar Header Toolbar & Initial View logic for mobile
  const headerToolbar = isMobile
    ? {
        left: "prev,next",
        center: "title",
        right: "dayGridMonth,timeGridDay", // Mobile par timeGridWeek ko hata diya
      }
    : {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      };

  const initialView = isMobile ? "dayGridMonth" : "dayGridMonth";
  // 🔥 NEW END

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, p: isMobile ? 1 : 2 }}>
      {" "}
      {/* 🔥 NEW: Mobile par padding kam ki */}
      <Paper elevation={4} sx={{ p: isMobile ? 1 : 2, height: "80vh" }}>
        {" "}
        {/* 🔥 NEW: Mobile par padding kam ki */}
        <FullCalendar
          plugins={plugins}
          initialView={initialView} // Mobile par bhi month view, but toolbar changes
          headerToolbar={headerToolbar} // 🔥 NEW: Responsive Toolbar
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          editable={true}
          selectable={true}
          height="100%"
          dayMaxEvents={true}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          eventStartEditable={true}
          eventDurationEditable={true}
        />
      </Paper>
      <TaskCreationModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        initialDate={selectedDate}
        onTaskCreated={loadTasks}
      />
      <TaskDetailModal
        open={detailModalOpen}
        handleClose={() => setDetailModalOpen(false)}
        taskId={selectedTaskId}
        onTaskUpdated={loadTasks}
      />
    </Box>
  );
}
