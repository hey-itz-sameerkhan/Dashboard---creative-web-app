// backend/routes/notificationRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js"; // Authentication middleware
import Notification from "../models/Notification.js"; // Notification Model

const router = express.Router();

// 1. POST /api/notifications
// @desc Create a new notification (used internally by frontend contexts/actions)
// @access Private
router.post("/", protect, async (req, res) => {
  try {
    // Note: 'source' field is now crucial (e.g., 'Task', 'Calendar')
    const { message, type, relatedId, source } = req.body; 

    if (!message || !source) { // Ensure source is provided for new notifications
      return res.status(400).json({ message: "Notification message and source are required." });
    }

    const notification = new Notification({
      userId: req.user.id, // Logged-in user's ID
      message,
      type: type || "info",
      relatedId: relatedId || null,
      read: false,
      source: source, // Save the source for filtering
    });

    const savedNotification = await notification.save();
    // Return the saved object to the frontend
    res.status(201).json(savedNotification);

  } catch (error) {
    console.error("❌ Error adding notification:", error);
    res.status(500).json({ message: "Server error while adding notification." });
  }
});

// 2. GET /api/notifications
// @desc Get all notifications for the logged-in user, sorted by newest (with optional source filter)
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    // ⭐ FIX 3 (Filtering): Check for optional 'source' query parameter
    const { source } = req.query; 

    // Base query always filters by the logged-in user
    let query = { userId: req.user.id };

    // Add source filter if provided (e.g., /api/notifications?source=Task)
    if (source) {
      query.source = source;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to 50 for performance

    res.json({ notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications." });
  }
});

// 3. PUT /api/notifications/:id/read
// @desc Mark a single notification as read
// @access Private
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Find by ID and User ID
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found or unauthorized." });
    }

    res.json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("❌ Error marking single read:", error);
    res.status(500).json({ message: "Server error while marking read." });
  }
});

// 4. PUT /api/notifications/read-all
// @desc Mark all unread notifications for the user as read
// @access Private
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false }, // Find all unread notifications for this user
      { read: true }
    );

    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("❌ Error marking all read:", error);
    res.status(500).json({ message: "Server error while marking all read." });
  }
});

// 5. DELETE /api/notifications/:id
// @desc ⭐ FIX 3 (Delete): Delete a single notification
// @access Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      userId: req.user.id, // Crucial: Only allow deletion of own notifications
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Notification not found or unauthorized." });
    }

    res.json({ message: "Notification removed successfully." });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({ message: "Server error while deleting notification." });
  }
});

export default router;