// server/controllers/employee.controller.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');
const Timesheet = require('../models/timesheet.model');
const Blog = require('../models/blog.model');
const Todo = require('../models/todo.model');

// --- Helper Functions ---

/**
 * Calculates the start date of the current month.
 */
const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};


// --- Controller Actions ---

/**
 * @desc    Get summary data for the Employee Dashboard
 * @route   GET /api/employee/dashboard-summary
 * @access  Private (Employee)
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const startOfMonth = getStartOfMonth();

        // 1. Pending Tasks Count
        const pendingTasks = await Todo.countDocuments({ userId, completed: false });

        // 2. Monthly Hours Logged
        const hoursLoggedResult = await Timesheet.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId), // Convert to ObjectId for aggregation
                    date: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$hours' }
                }
            }
        ]);

        // 3. Last 3 Activities
        const recentActivities = await Activity.find({ userId })
            .sort({ timestamp: -1 })
            .limit(3)
            .select('action timestamp');

        res.json({
            pendingTasks,
            monthlyHours: hoursLoggedResult[0]?.totalHours || 0,
            recentActivities,
            welcomeMessage: "Welcome back! Here's your summary."
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: error });
    }
};

/**
 * @desc    Get all Activity Logs for the logged-in user
 * @route   GET /api/employee/activities
 * @access  Private (Employee)
 */
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await Activity.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .select('-__v');
        res.json(logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Failed to fetch activity logs.' });
    }
};

/**
 * @desc    Get Timesheet entries for the logged-in user
 * @route   GET /api/employee/timesheets
 * @access  Private (Employee)
 */
exports.getTimesheets = async (req, res) => {
    try {
        const timesheets = await Timesheet.find({ userId: req.user.id })
            .sort({ date: -1 }) // Sort by most recent date
            .select('-__v');
        res.json(timesheets);
    } catch (error) {
        console.error('Error fetching timesheets:', error);
        res.status(500).json({ message: 'Failed to fetch timesheet data.' });
    }
};

/**
 * @desc    Get the profile details of the current logged-in user
 * @route   GET /api/employee/profile
 * @access  Private (Employee/Admin)
 */
exports.getProfile = async (req, res) => {
    try {
        // Find user by ID extracted from the JWT token (req.user.id)
        const profile = await User.findById(req.user.id)
            .select('-password -__v -managerId'); // Exclude sensitive/unnecessary fields

        if (!profile) {
            return res.status(404).json({ message: 'Profile data not found.' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ message: 'Failed to fetch profile data.' });
    }
};
// server/controllers/employee.controller.js (Add this new function)


// server/controllers/employee.controller.js (Updated createActivityLog)

//const Activity = require('../models/activity.model');
// ... existing imports ...

/**
 * @desc    Create a new activity log entry for the user
 * @route   POST /api/employee/activities
 * @access  Private (Employee)
 */
exports.createActivityLog = async (req, res) => {
    try {
        const { action, details, hours, timestamp } = req.body; // ⬅️ Includes hours

        // Validation check
        if (!action || action.trim() === '' || hours === undefined || hours < 0.5 || hours > 9.5 || isNaN(hours) || !timestamp) {
            return res.status(400).json({
                message: 'Action, Hours (0.5 to 9.5), and Timestamp are required.'
            });
        }

        const newActivity = new Activity({
            userId: req.user.id,
            action,
            details: details || 'No details provided',
            hours: hours, // ⬅️ Save the validated hours
            timestamp: new Date(timestamp) // Ensure timestamp is a Date object
        });

        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (error) {
        console.error('Error creating activity log:', error);
        // MongoDB validation errors (like exceeding max: 9.5) will be caught here
        res.status(500).json({ message: 'Failed to create new activity log due to data constraints.' });
    }
};

// server/controllers/employee.controller.js (Add this new function)


// ... existing imports ...

/**
 * @desc    Create a new timesheet entry for the user
 * @route   POST /api/employee/timesheets
 * @access  Private (Employee)
 */
exports.createTimesheetEntry = async (req, res) => {
    try {
        const { date, taskDescription, hours } = req.body;

        if (!date || !taskDescription || !hours || isNaN(hours) || hours <= 0) {
            return res.status(400).json({ message: 'Valid date, task description, and hours > 0 are required.' });
        }

        const newEntry = new Timesheet({
            userId: req.user.id, // Linked to the authenticated user ID
            date: new Date(date), // Ensure date is correctly parsed
            taskDescription,
            hours
        });

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Error creating timesheet entry:', error);
        res.status(500).json({ message: 'Failed to create new timesheet entry.' });
    }
};

// Update exports:
// exports.getTimesheets = ...
// exports.createTimesheetEntry = ... // Add to exports
// ...
