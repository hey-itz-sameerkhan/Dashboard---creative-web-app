// backend/controllers/taskController.js (FINALIZED & FULLY FIXED)

import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import Task from '../models/Task.js';
import User from '../models/User.js';


// ------------------------------------------------
// --- HELPER FUNCTIONS FOR NOTIFICATION ---
// ------------------------------------------------

// 1. Assignment Notification (Used in createTask and updateTask for reassignment)
const createAssignmentNotification = async (task) => {
    
    // Format the date nicely for the message
    const dueDate = new Date(task.startDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const notificationMessage = `You have been assigned a new ${task.type}: "${task.title}". Due on: ${dueDate}.`;
    
    // Check if the assigned user exists and is different from the creator (to avoid self-notification)
    if (task.assignedTo && !task.assignedTo.equals(task.createdBy)) {
        await Notification.create({
            userId: task.assignedTo, 
            message: notificationMessage,
            relatedId: task._id, 
            read: false,
            type: 'info', 
            source: 'Task', 
        });
    }
};

// 2. Status Change Notification (Used in updateTaskStatus/updateTask to notify creator)
const createStatusChangeNotification = async (task, updaterId) => {
    // Notify the creator if the person updating is NOT the creator
    if (task.createdBy && !task.createdBy.equals(updaterId)) {
        // Fetch updater's name for better message context
        const updater = await User.findById(updaterId).select('name');
        const notificationMessage = `${updater ? updater.name : 'A user'} updated your task: "${task.title}". New status: ${task.status}.`;
        
        await Notification.create({
            userId: task.createdBy, // Notify the creator
            message: notificationMessage,
            relatedId: task._id,
            read: false,
            // Use 'success' type if task is completed
            type: task.status === 'Completed' ? 'success' : 'info', 
            source: 'Task',
        });
    }
};

// 3. High Priority Notification
const createHighPriorityNotification = async (task) => {
    // Check for 'High' priority
    if (task.priority === 'High') {
        const dueDate = new Date(task.startDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const highPriorityMessage = `🚨 URGENT: High Priority ${task.type} assigned: "${task.title}". Due on: ${dueDate}. Please review immediately.`;

        // Notify the assigned user (Primary Recipient)
        // Check to ensure assignedTo is set before creating notification
        if (task.assignedTo) {
            await Notification.create({
                userId: task.assignedTo,
                message: highPriorityMessage,
                relatedId: task._id,
                read: false,
                type: 'error', // Use 'error' for highest visual urgency
                source: 'Task',
            });
        }
        
        // Also notify the creator if they are different from the assignee
        if (task.assignedTo && !task.createdBy.equals(task.assignedTo)) {
            await Notification.create({
                userId: task.createdBy,
                message: highPriorityMessage,
                relatedId: task._id,
                read: false,
                type: 'error',
                source: 'Task',
            });
        }
    }
};
// ------------------------------------------------

// @desc    Create a new Task/Event and send notification
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description, startDateTime, endDateTime, priority, assignedTo, type, status } = req.body;

    if (!title || !startDateTime || !type) {
        res.status(400);
        throw new Error('Please include a title, start date/time, and type for the task/event.');
    }
    
    const finalAssignedTo = assignedTo || req.user._id;

    const task = await Task.create({
        title,
        description,
        startDateTime: startDateTime, 
        endDateTime: endDateTime,   
        priority: priority || 'Medium',
        type,
        assignedTo: finalAssignedTo, 
        createdBy: req.user._id, 
        status: status || 'Pending', 
    });

    if (task) {
        await createAssignmentNotification(task);
        await createHighPriorityNotification(task);

        // Safe population method for newly created document
        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            message: `${populatedTask.type} created successfully.`,
            task: populatedTask,
        });
    } else {
        res.status(400);
        throw new Error('Invalid task data received.');
    }
});

// @desc    Fetch all Tasks/Events for the Calendar
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({
        $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }]
    })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name')
    .sort({ startDateTime: 1, priority: -1 });

    res.status(200).json(tasks);
});

// @desc    Fetch a single Task/Event by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name');

    if (!task) {
        res.status(404);
        throw new Error('Task/Event not found');
    }

    // Security Check: Only allow if user is the creator OR is the assigned user
    const isCreator = task.createdBy.equals(req.user._id);
    const isAssigned = task.assignedTo && task.assignedTo.equals(req.user._id);

    if (!isCreator && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to view this task/event.');
    }

    res.status(200).json(task);
});


// @desc    Update a Task/Event (General Update - PUT /api/tasks/:id)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task/Event not found');
    }

    // Security Check: (Unchanged)
    const isCreator = task.createdBy.equals(req.user._id);
    const isAssigned = task.assignedTo && task.assignedTo.equals(req.user._id);
    
    if (!isCreator && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to update this task/event. Only the creator or assigned user can update.');
    }

    // Capture old states for notification checks
    const oldAssignedToId = task.assignedTo ? task.assignedTo.toString() : null;
    const oldPriority = task.priority; 
    const oldStatus = task.status;

    // Update the task
    task.set(req.body); 
    await task.save({ runValidators: true }); // Save the unpopulated document
    
    // 🚀 FINAL FIX: Re-fetch the task using findById and populate in one reliable chain
    const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name');

    const newAssignedToId = populatedTask.assignedTo ? populatedTask.assignedTo._id.toString() : null;
    const newPriority = populatedTask.priority;
    const newStatus = populatedTask.status;


    // Notification logic 
    if (newAssignedToId && oldAssignedToId !== newAssignedToId) {
        await createAssignmentNotification(populatedTask);
    }
    if (oldStatus !== newStatus) {
        await createStatusChangeNotification(populatedTask, req.user._id);
    }
    if (newPriority === 'High' && oldPriority !== 'High') {
        await createHighPriorityNotification(populatedTask);
    }

    res.json({ success: true, task: populatedTask, message: 'Task/Event updated successfully.' });
});

// ------------------------------------------------
// NEW CONTROLLER: UPDATE TASK STATUS ONLY 
// (PATCH /api/tasks/:id/status)
// ------------------------------------------------

// @desc    Update ONLY the status of a Task/Event
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!status) {
        res.status(400);
        throw new Error('Task status is required for this update.');
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task/Event not found');
    }

    // Security Check: (Unchanged)
    const isCreator = task.createdBy.equals(req.user._id);
    const isAssigned = task.assignedTo && task.assignedTo.equals(req.user._id);

    if (!isCreator && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to update the status of this task/event. Only the creator or assigned user can change status.');
    }
    
    // Save old status for comparison
    const oldStatus = task.status;

    // Update the status and save
    task.status = status;
    await task.save(); 
    
    // 🚀 FINAL FIX: Re-fetch the task using findById and populate in one reliable chain
    const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name');


    // Notification Logic: Notify the creator if the status changes
    if (oldStatus !== populatedTask.status) {
        await createStatusChangeNotification(populatedTask, req.user._id);
    }

    res.json({ success: true, task: populatedTask, message: `Task status updated to ${populatedTask.status}.` });
});


// @desc    Delete a Task/Event
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        // Security Check: Only allow if user is the creator to delete the task
        if (!task.createdBy.equals(req.user._id)) {
            res.status(403);
            throw new Error('Not authorized to delete this task/event. Only the creator can delete.');
        }

        await Task.deleteOne({ _id: req.params.id });

        res.json({ success: true, message: 'Task/Event removed successfully.' });
    } else {
        res.status(404);
        throw new Error('Task/Event not found');
    }
});


// FINAL EXPORT: 
export {
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateTask,
    updateTaskStatus
};
