// backend/models/Task.js (FINALIZED: Consistency checked with Controllers & Analytics)

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, "Title is required."],
        trim: true, 
        minlength: [3, "Title must be at least 3 characters long."] 
    },
    
    description: { 
        type: String, 
        trim: true 
    },
    
    status: {
        type: String,
        // ✅ FINAL FIX: Status values must use a SPACE to match Kanban UI and Analytics logic ('In Progress')
        enum: ["Pending", "In Progress", "Completed"], 
        default: "Pending",
        required: true,
    },

    priority: {
        type: String,
        // Correct Capitalized values to match Controller/Analytics
        enum: ["Low", "Medium", "High"],
        default: "Medium",
        required: true,
    },

    type: { 
        type: String,
        // Correct capitalized values for Task/Event types used in Analytics Stacked Bar Chart
        enum: ["Task", "Event", "Meeting", "Reminder"],
        default: "Task",
        required: [true, "Type is required for Calendar logic."],
    },
    
    // Scheduling fields are correct
    startDateTime: {
        type: Date,
        required: [true, "Start Date/Time is required for scheduling."], 
    },
    
    endDateTime: {
        type: Date,
        required: false,
    },

    // User relationship fields are correct
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, 
    }
}, { 
    timestamps: true 
});

// ✅ Model Export
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;