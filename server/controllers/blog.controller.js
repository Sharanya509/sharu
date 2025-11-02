// server/controllers/blog.controller.js

const Blog = require('../models/blog.model');
const User = require('../models/user.model');

/**
 * @desc    Get all blog posts, sorted by most recent first
 * @route   GET /api/employee/blogs
 * @access  Private (Employee)
 */
exports.getAllBlogs = async (req, res) => {
    try {
        // Fetch all blog posts and sort them descending by creation date
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching all blog posts:', error);
        res.status(500).json({ message: 'Failed to fetch all blog posts.' });
    }
};

/**
 * @desc    Get blog posts created only by the logged-in user
 * @route   GET /api/employee/blogs/my-posts
 * @access  Private (Employee)
 */
exports.getMyBlogs = async (req, res) => {
    try {
        // Use the authenticated user ID from the JWT payload
        const myBlogs = await Blog.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json(myBlogs);
    } catch (error) {
        console.error('Error fetching user blog posts:', error);
        res.status(500).json({ message: 'Failed to fetch your blog posts.' });
    }
};

/**
 * @desc    Create a new blog post
 * @route   POST /api/employee/blogs
 * @access  Private (Employee)
 */
exports.createBlogPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required for a blog post.' });
        }

        // Fetch user data to get the author's name for denormalization
        const user = await User.findById(req.user.id).select('name');

        if (!user) {
            return res.status(404).json({ message: 'Author user not found.' });
        }

        const newBlog = new Blog({
            userId: req.user.id,
            authorName: user.name, // Use the user's name from the updated User model
            title,
            content
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Failed to create blog post.' });
    }
};

// NOTE: Edit and Delete functionalities for blog posts should be added here
// if the application allows employees to manage their posts after creation.

// server/controllers/blog.controller.js (Add this new function)

/**
 * @desc    Delete a specific blog post
 * @route   DELETE /api/employee/blogs/:id
 * @access  Private (Employee/Admin - must be author or Admin)
 */
exports.deleteBlogPost = async (req, res) => {
    try {
        const { id: blogId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the blog post
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        // Authorization Check: Must be the author OR an Admin
        const isAuthor = blog.userId.toString() === userId.toString();

        if (userRole !== 'Admin' && !isAuthor) {
            return res.status(403).json({ message: 'Forbidden. You do not have permission to delete this post.' });
        }

        // Delete the post
        await Blog.deleteOne({ _id: blogId });

        res.status(204).send(); // Success, No Content

    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ message: 'Failed to delete blog post.' });
    }
};

// Update module.exports to include deleteBlogPost
// ... existing exports ...
// exports.deleteBlogPost = deleteBlogPost;