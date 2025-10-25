// frontend/src/context/TaskContext.jsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// ✅ FIXED: Import paths for Contexts updated to '../context/...' or '../utils/...'
// (assuming all context files are parallel to this one in 'src/context')
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { useNotification } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";
// 🔑 API imports (Path fixed)
import {
  addTask,
  deleteTask,
  fetchTasks,
  updateTask,
  updateTaskStatus,
} from "../utils/api";
// ❌ PDF Generator import removed
// import { generateTasksReportPDF } from "../utils/pdfGenerator";
// ❌ Chart utility functions import removed
// import { generateBarChartImage, generatePieChartImage } from "../utils/chartUtils";

// 🚨 REMINDER CONSTANTS MOVED HERE
const REMINDER_INTERVAL_MS = 5400000; // 90 minutes
const CHECK_INTERVAL_MS = 30000; // Check every 30 seconds
const STATUS_COLUMNS = {
  Pending: { title: "To Do", color: "#ffc107" }, // MUI warning.main (Hex for PDF)
  "In Progress": { title: "In Progress", color: "#2196f3" }, // MUI info.main (Hex for PDF)
  Completed: { title: "Complete", color: "#4caf50" }, // MUI success.main (Hex for PDF)
};

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { addAppNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // High Priority Alert States

  const [highPriorityAlert, setHighPriorityAlert] = useState(false);
  const [highPriorityTasks, setHighPriorityTasks] = useState([]);
  const [lastAlertTime, setLastAlertTime] = useState(
    parseInt(localStorage.getItem("lastTaskAlertTime") || "0", 10)
  ); // 1. Data Fetcher (loadTasks)

  const loadTasks = useCallback(async () => {
    // ... (loadTasks logic remains the same)
    if (!user?._id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await fetchTasks();

      const tasksArray = (
        Array.isArray(response)
          ? response
          : response.tasks || response.data || []
      ).map((task) => ({
        ...task,
        _id: String(task._id),
        status:
          task.status?.charAt(0).toUpperCase() +
            task.status?.slice(1).replace("-", " ") || "Pending",
        priority:
          task.priority?.charAt(0).toUpperCase() +
            task.priority?.slice(1).toLowerCase() || "Medium",
      }));

      setTasks(tasksArray);

      const highNotes = tasksArray.filter(
        (t) => t.priority === "High" && t.status !== "Completed"
      );
      setHighPriorityTasks(highNotes);

      const currentTime = Date.now();
      if (
        highNotes.length > 0 &&
        currentTime - lastAlertTime > REMINDER_INTERVAL_MS
      ) {
        setHighPriorityAlert(true);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please ensure your server is running.");
      showToast("Failed to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, lastAlertTime, user]); // Initial Load Effect (Unchanged)

  useEffect(() => {
    loadTasks();
  }, [loadTasks]); // Recurring Reminder Logic (Unchanged)

  useEffect(() => {
    // ... (Reminder logic remains the same)
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      if (
        highPriorityTasks.length > 0 &&
        !highPriorityAlert &&
        currentTime - lastAlertTime > REMINDER_INTERVAL_MS
      ) {
        setHighPriorityAlert(true);
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [highPriorityTasks.length, highPriorityAlert, lastAlertTime]); // 2. CRUD Handlers (Unchanged)

  const handleAddTask = async (taskToAdd) => {
    // ... (handleAddTask logic remains the same)
    try {
      if (!taskToAdd.title.trim())
        throw new Error("Task title cannot be empty.");

      const response = await addTask(taskToAdd);
      const addedTask = response.task || response.data || response;

      loadTasks();
      showToast("Task added successfully!", "success");
      await addAppNotification(
        "success",
        `New task "${addedTask.title.substring(0, 30)}..." added.`,
        addedTask._id,
        "Task"
      );
      return addedTask;
    } catch (err) {
      const errorMessage =
        err.message || "Failed to add task due to a server error.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      throw err;
    }
  };

  const handleUpdateTask = async (id, updatedData) => {
    // ... (handleUpdateTask logic remains the same)
    const taskToUpdate = tasks.find((t) => t._id === id);
    if (!taskToUpdate) return; // Optimistic Update

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === id ? { ...t, ...updatedData } : t))
    );

    try {
      // Correct API call usage: updateTaskStatus for status, updateTask for others
      const apiCall = updatedData.status
        ? updateTaskStatus(id, updatedData.status)
        : updateTask(id, updatedData);

      await apiCall;
      loadTasks(); // Re-fetch to apply sorting and ensure consistency
      showToast("Task updated successfully!", "success");
      await addAppNotification(
        "info",
        `Task "${taskToUpdate.title.substring(0, 30)}..." updated.`,
        id,
        "Task"
      );
    } catch (err) {
      // Revert the state on failure
      loadTasks();
      showToast("Failed to save task update.", "error"); // CRITICAL: Re-throw the error so UI knows update failed.
      throw err;
    }
  };

  const handleDeleteTask = async (task) => {
    // ... (handleDeleteTask logic remains the same)
    const result = await confirm(
      "Confirm Deletion",
      `Are you sure you want to permanently delete the task: "${task.title}"?`
    );

    if (result) {
      try {
        await deleteTask(task._id);
        setTasks((prevTasks) => prevTasks.filter((t) => t._id !== task._id));
        showToast("Task deleted.", "success");
        await addAppNotification(
          "error",
          `Task "${task.title.substring(0, 30)}..." deleted.`,
          task._id,
          "Task"
        );
      } catch (err) {
        setError("Failed to delete task.");
        showToast("Failed to delete task.", "error");
      }
    }
  }; // 3. PDF Download Handler (REMOVED) // ❌ handleDownloadReport function was here, and has been completely removed. // 4. Reminder Alert Handler (Unchanged)

  const handleCloseHighPriorityAlert = () => {
    // ... (handleCloseHighPriorityAlert logic remains the same)
    const currentTime = Date.now();
    setHighPriorityAlert(false);
    setLastAlertTime(currentTime);
    localStorage.setItem("lastTaskAlertTime", currentTime.toString());
  }; // 5. Kanban Grouping Helper (Unchanged)

  const groupedTasks = useMemo(() => {
    // ... (groupedTasks logic remains the same)
    const groups = { Pending: [], "In Progress": [], Completed: [] };
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priorityDiff =
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });

    sortedTasks.forEach((task) => {
      const statusKey = task.status in STATUS_COLUMNS ? task.status : "Pending";
      groups[statusKey].push(task);
    });
    return groups;
  }, [tasks]);

  const contextValue = {
    // Data
    tasks,
    loading,
    error,
    groupedTasks,
    STATUS_COLUMNS, // CRUD Operations
    loadTasks,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask, // Utilities // ❌ handleDownloadReport removed from contextValue
    highPriorityAlert,
    highPriorityTasks,
    handleCloseHighPriorityAlert,
  };

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
};
