// server/routes/admin.routes.js

const express = require('express');
const router = express.Router();

// Import middleware for security
const { protect, admin } = require('../middleware/auth.middleware');

// Import controllers
const adminController = require('../controllers/admin.controller');


// --- APPLY PROTECTION MIDDLEWARE ---
// All routes defined after this line will require a valid JWT AND the 'Admin' role.
router.use(protect, admin);


// --- USER MANAGEMENT ROUTES ---
/**
 * @route   POST /api/admin/users
 * @desc    Admin creates a new user (Employee or Admin)
 */
router.post('/users', adminController.createUser);


// --- HR DASHBOARD / EMPLOYEE DATA ROUTES ---
/**
 * @route   GET /api/admin/employees-data
 * @desc    Get a list of all Employees with aggregated activity data
 */
router.get('/employees-data', adminController.getAllEmployeesData);


// --- BLOG INSIGHTS ROUTES ---
/**
 * @route   GET /api/admin/blog-insights
 * @desc    Get analytical data on blog engagement
 */
router.get('/blog-insights', adminController.getBlogInsights);

/**
 * @route   GET /api/admin/all-activities
 * @desc    Get all activity logs (list view)
 */
router.get('/all-activities', adminController.getAllActivityLogs);

/**
 * @route   GET /api/admin/activity-insights
 * @desc    Get summary statistics for all activities
 */
router.get('/activity-insights', adminController.getActivityInsights);

module.exports = router;
