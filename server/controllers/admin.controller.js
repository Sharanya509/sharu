// server/controllers/admin.controller.js

const User = require('../models/user.model');
const Activity = require('../models/activity.model');
const Blog = require('../models/blog.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// --- User Management ---

/**
 * @desc    Admin creates a new user (Employee or Admin)
 * @route   POST /api/admin/users
 * @access  Private (Admin)
 */
exports.createUser = async (req, res) => {
    try {
        const { employeeId, name, email, password, role, managerId } = req.body;

        // 1. Basic Validation
        if (!employeeId || !name || !email || !password || !role) {
            return res.status(400).json({ message: 'Missing required user fields.' });
        }

        // 2. Check if user already exists by email or employeeId
        const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or employee ID already exists.' });
        }

        // 3. Hash Password (IMPORTANT SECURITY STEP)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User
        const newUser = await User.create({
            employeeId,
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            managerId: managerId || null // Use provided managerId or null
        });

        // 5. Return created user data (excluding password)
        res.status(201).json({
            _id: newUser._id,
            employeeId: newUser.employeeId,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user. Server error.' });
    }
};

// --- Employee Data Insights (HR Dashboard) ---

/**
 * @desc    Admin gets a list of all Employees with their total activities logged
 * @route   GET /api/admin/employees-data
 * @access  Private (Admin)
 */
exports.getAllEmployeesData = async (req, res) => {
    try {
        // 1. Pipeline to get activity count per user
        const activityCounts = await Activity.aggregate([
            // Group activities by userId and count them
            { $group: { _id: '$userId', totalActivities: { $sum: 1 } } }
        ]);

        // 2. Fetch all Employee users
        const employees = await User.find({ role: 'Employee' }).select('-password -__v -managerId');

        // 3. Map activity counts to the employee data
        const employeeData = employees.map(employee => {
            const countData = activityCounts.find(
                // Use .equals() for reliable ObjectId comparison
                count => count._id.equals(employee._id)
            );
            return {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                createdAt: employee.createdAt,
                totalActivities: countData ? countData.totalActivities : 0,
            };
        });

        res.json(employeeData);
    } catch (error) {
        console.error('Error fetching HR data:', error);
        res.status(500).json({ message: 'Failed to fetch employees and activity data.' });
    }
};

// --- Blog Insights ---

/**
 * @desc    Admin gets analytical insights into blog engagement
 * @route   GET /api/admin/blog-insights
 * @access  Private (Admin)
 */
exports.getBlogInsights = async (req, res) => {
    try {
        // 1. Get Total Counts
        const totalPosts = await Blog.countDocuments();

        // 2. Get Unique Authors Count
        const uniqueAuthorsResult = await Blog.aggregate([
            { $group: { _id: '$userId' } },
            { $count: 'uniqueAuthors' }
        ]);
        const uniqueAuthors = uniqueAuthorsResult[0]?.uniqueAuthors || 0;

        // 3. Top 5 Most Active Bloggers (by post count)
        const topBloggers = await Blog.aggregate([
            {
                $group: {
                    _id: '$authorName',
                    postCount: { $sum: 1 }
                }
            },
            { $sort: { postCount: -1 } },
            { $limit: 5 }
        ]);

        // 4. Posts per Day (Last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const postsLast30Days = await Blog.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalPosts,
            uniqueAuthors,
            topBloggers,
            postsLast30Days,
        });

    } catch (error) {
        console.error('Error fetching blog insights:', error);
        res.status(500).json({ message: 'Failed to fetch blog analytics data.' });
    }
};

// --- Activity Logs Insights ---
/**
 * @desc    Admin gets all activity logs from ALL employees
 * @route   GET /api/admin/all-activities
 * @access  Private (Admin)
 */
exports.getAllActivityLogs = async (req, res) => {
    try {
        // Fetch all activities, populate the user name, and sort by recent timestamp
        const logs = await Activity.find({})
            .populate('userId', 'name employeeId') // Populate name and ID from User model
            .sort({ timestamp: -1 })
            .select('-__v');

        res.json(logs);
    } catch (error) {
        console.error('Error fetching all activity logs:', error);
        res.status(500).json({ message: 'Failed to retrieve all activity logs.' });
    }
};

/**
 * @desc    Admin gets insights (summary stats) from all activity logs
 * @route   GET /api/admin/activity-insights
 * @access  Private (Admin)
 */
exports.getActivityInsights = async (req, res) => {
    try {
        const totalLogs = await Activity.countDocuments();

        // ⬇️ AGGREGATION: Logs and Hours per Activity Category (For Charts) ⬇️
        const categoryMetrics = await Activity.aggregate([
            {
                $group: {
                    _id: "$action", // Group by activity name/category
                    count: { $sum: 1 }, // Total logs for this action (Pie Chart data)
                    totalHours: { $sum: "$hours" } // Total hours spent on this action (Bar Chart data)
                }
            },
            { $sort: { "totalHours": -1 } } // Sort by total hours
        ]);

        // Logs per month trend
        const monthlyTrend = await Activity.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
                    count: { $sum: 1 },
                    totalHours: { $sum: "$hours" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Top 5 Activities (by count)
        const topActivities = await Activity.aggregate([
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 }
                }
            },
            { $sort: { "count": -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalLogs,
            monthlyTrend,
            topActivities,
            categoryMetrics,
            totalHoursLoggedEver: monthlyTrend.reduce((sum, item) => sum + item.totalHours, 0)
        });

    } catch (error) {
        console.error('Error fetching activity insights:', error);
        res.status(500).json({ message: 'Failed to retrieve activity insights.' });
    }
};