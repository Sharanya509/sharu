// server/models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // MongoDB's default _id will automatically handle the unique ID

    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true // Ensure emails are saved in a consistent format
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Employee', 'Admin'], // Enforces valid roles
        required: true
    },
    managerId: {
        // References another User's _id (optional/nullable)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    // Mongoose option to include virtuals and timestamps if needed
    timestamps: true
});

// server/models/user.model.js (Addition)
const bcrypt = require('bcryptjs');
// ...

userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// ... module.exports ...

module.exports = mongoose.model('User', userSchema);