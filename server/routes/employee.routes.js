// server/routes/employee.routes.js

const express = require('express');
const router = express.Router();

// Import middleware for security
const { protect, employee, employeeOrAdmin } = require('../middleware/auth.middleware');

// Import controllers
const employeeController = require('../controllers/employee.controller');
const todoController = require('../controllers/todo.controller');
const blogController = require('../controllers/blog.controller');


// --- CUSTOM MIDDLEWARE: ALLOW EMPLOYEE OR ADMIN ---
// This function checks for a valid JWT and then verifies EITHER role.

// --- SHARED READ ROUTES (Requires JWT + EITHER Role for READ operations) ---
// These routes do NOT use router.use(protect, employee)
/**
 * @route   GET /api/employee/blogs
 * @desc    Get all blog posts (READ access for both roles)
 */
router.get('/blogs', protect, employeeOrAdmin, blogController.getAllBlogs);

/**
 * @route   DELETE /api/employee/blogs/:id
 * @desc    Delete a specific blog post by ID
 */
router.delete('/blogs/:id', protect, employeeOrAdmin, blogController.deleteBlogPost);

/**
 * @route   GET /api/employee/profile
 * @desc    Get the details of the current logged-in user (READ access for both roles)
 */

router.get('/profile', protect, employeeOrAdmin, employeeController.getProfile);


// --- APPLY PROTECTION MIDDLEWARE ---
// All routes defined after this line will require a valid JWT AND the 'Employee' role.
router.use(protect, employee);


// --- CORE EMPLOYEE DATA ROUTES ---
/**
 * @route   GET /api/employee/dashboard-summary
 * @desc    Get summary stats for the employee dashboard
 */
router.get('/dashboard-summary', employeeController.getDashboardSummary);

/**
 * @route   GET /api/employee/activities
 * @desc    Get all activity logs for the current user
 */
router.get('/activities', employeeController.getActivityLogs);

/**
 * @route   GET /api/employee/timesheets
 * @desc    Get all timesheet entries for the current user
 */
router.get('/timesheets', employeeController.getTimesheets);

/**
 * @route   GET /api/employee/profile
 * @desc    Get the details of the current logged-in user
 */
router.get('/profile', employeeController.getProfile);


// --- TO-DO LIST ROUTES (CRUD) ---
/**
 * @route   GET /api/employee/todos
 * @desc    Get all To-Do items for the current user
 */
router.get('/todos', todoController.getTodoList);

/**
 * @route   POST /api/employee/todos
 * @desc    Create a new To-Do item
 */
router.post('/todos', todoController.createTodo);

/**
 * @route   PUT /api/employee/todos/:id
 * @desc    Update a specific To-Do item
 */
router.put('/todos/:id', todoController.updateTodo);

/**
 * @route   DELETE /api/employee/todos/:id
 * @desc    Delete a specific To-Do item
 */
router.delete('/todos/:id', todoController.deleteTodo);


// --- BLOG POST ROUTES (Employee can read all, but manage their own) ---
/**
 * @route   GET /api/employee/blogs
 * @desc    Get all blog posts (recent first)
 */
router.get('/blogs', blogController.getAllBlogs);

/**
 * @route   GET /api/employee/blogs/my-posts
 * @desc    Get blog posts created only by the current user
 */
router.get('/blogs/my-posts', blogController.getMyBlogs);

/**
 * @route   POST /api/employee/blogs
 * @desc    Create a new blog post
 */
router.post('/blogs', blogController.createBlogPost);

// server/routes/employee.routes.js (Add this route)
// ... existing router.use(protect, employee);

// ... existing GET /activities

/**
 * @route   POST /api/employee/activities
 * @desc    Create a new activity log entry
 */
router.post('/activities', employeeController.createActivityLog);

// ... existing routes

// server/routes/employee.routes.js (Add this route)
// ... existing router.use(protect, employee);

// ... existing GET /timesheets

/**
 * @route   POST /api/employee/timesheets
 * @desc    Create a new timesheet entry
 */
router.post('/timesheets', employeeController.createTimesheetEntry);

// server/routes/employee.routes.js (Add this route)

// ... existing router.use(protect, employee);

// ... existing GET, POST /blogs routes ...



// ... existing routes

// ... existing routes

module.exports = router;