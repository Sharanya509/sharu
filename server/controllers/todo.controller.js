// server/controllers/todo.controller.js

const Todo = require('../models/todo.model');

/**
 * @desc    Get all To-Do items for the logged-in user
 * @route   GET /api/employee/todos
 * @access  Private (Employee)
 */
exports.getTodoList = async (req, res) => {
    try {
        // Find tasks where userId matches the ID from the validated JWT token
        const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: 1 });
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Failed to fetch to-do list.' });
    }
};

/**
 * @desc    Create a new To-Do item
 * @route   POST /api/employee/todos
 * @access  Private (Employee)
 */
exports.createTodo = async (req, res) => {
    try {
        const { task } = req.body;

        if (!task || task.trim() === '') {
            return res.status(400).json({ message: 'Task description is required.' });
        }

        const newTodo = new Todo({
            userId: req.user.id, // Link task to the authenticated user ID
            task
        });

        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ message: 'Failed to create new task.' });
    }
};

/**
 * @desc    Update a To-Do item (task or completed status)
 * @route   PUT /api/employee/todos/:id
 * @access  Private (Employee)
 */
exports.updateTodo = async (req, res) => {
    try {
        // Find the task by ID AND ensure it belongs to the logged-in user
        const todo = await Todo.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!todo) {
            return res.status(404).json({ message: 'Task not found or unauthorized.' });
        }

        // Update fields if provided in the body
        if (req.body.task !== undefined) {
            todo.task = req.body.task.trim();
        }
        if (req.body.completed !== undefined) {
            todo.completed = req.body.completed;
        }

        await todo.save();
        res.json(todo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ message: 'Failed to update task.' });
    }
};

/**
 * @desc    Delete a To-Do item
 * @route   DELETE /api/employee/todos/:id
 * @access  Private (Employee)
 */
exports.deleteTodo = async (req, res) => {
    try {
        // Delete the task by ID AND ensure it belongs to the logged-in user
        const result = await Todo.deleteOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Task not found or unauthorized.' });
        }

        // 204 No Content response is standard for successful DELETE
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ message: 'Failed to delete task.' });
    }
};