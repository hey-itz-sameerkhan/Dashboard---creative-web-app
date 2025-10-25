// backend/models/Notification.js (UPDATED for Source/Category)

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  // Link to the user who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // The message content
  message: {
    type: String,
    required: true,
  },

  // Type of notification (for icon/color in frontend)
  type: {
    type: String,
    enum: ["success", "info", "warning", "error"],
    default: "info",
  },

  // Is it read by the user?
  read: {
    type: Boolean,
    default: false,
    index: true,
  },

  // Optional: Link to a task or other entity
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task", // Assuming it primarily links to a task
    required: false,
  },

  // 🎯 FIX: New field to store the source of the notification (e.g., Task, Calendar)
  source: {
    type: String,
    enum: ["Task", "Calendar", "Profile", "General"], // Define possible sources
    default: "General",
    required: true, // Making it required ensures every notification has a category
  },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);