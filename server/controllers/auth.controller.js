// server/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

/**
 * Helper function to generate a JWT token.
 */
const generateToken = (id, role) => {
    return jwt.sign(
        { id: id, role: role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token valid for 1 day
    );
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // 1. Find the user by email and specified role
        const user = await User.findOne({ email: email.toLowerCase(), role });

        if (!user) {
            // Use a generic message for security to prevent role/email fishing
            return res.status(401).json({ message: 'Invalid credentials or role selected.' });
        }

        // 2. Compare the provided password with the hashed password in the database
        // NOTE: The password in the database ($2b$10$GurLH7kGOAQ...) is already hashed.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials or role selected.' });
        }

        // 3. Authentication successful: Generate Token
        const token = generateToken(user._id, user.role);

        // 4. Send the token and user data back to the client
        res.json({
            message: 'Login successful',
            token,
            role: user.role,
            name: user.name,
            employeeId: user.employeeId
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

// NOTE: You would typically add a 'register' function here,
// but for this project, user creation is an Admin-only task.