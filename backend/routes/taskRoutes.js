// backend/routes/taskRoutes.js (FINAL FIX)

// Assuming your backend uses ES modules (import/export)
import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  // 🛑 FIX 1: Import the new controller
  updateTaskStatus,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js"; // Authentication middleware

const router = express.Router();

// --- Main Routes: /api/tasks ---

/**
 * @route   POST /api/tasks
 * @desc    Create a new Task
 * @access  Private (protected by auth middleware)
 * @route   GET /api/tasks
 * @desc    Get all Tasks for the logged-in user
 * @access  Private
 */
router.route("/")
    .post(protect, createTask) 
    .get(protect, getTasks); 


// --- Specific Task Routes: /api/tasks/:id ---

/**
 * @route   GET /api/tasks/:id
 * @desc    Fetch a single task by ID
 * @access  Private
 * @route   PUT /api/tasks/:id
 * @desc    Update a task by ID (General update)
 * @access  Private
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task by ID
 * @access  Private
 */
router.route("/:id")
    .get(protect, getTaskById) 
    .put(protect, updateTask) 
    .delete(protect, deleteTask); 

// --------------------------------------------------------------------------
// 🛑 FIX 2: Define the dedicated route for status updates
// --------------------------------------------------------------------------

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update ONLY the status of a Task/Event (Used by Kanban/Dropdown)
 * @access  Private
 */
router.route("/:id/status").patch(protect, updateTaskStatus);


export default router;