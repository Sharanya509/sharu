// server/models/timesheet.model.js
const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    taskDescription: {
        type: String,
        required: true,
        trim: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0.1
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Timesheet', timesheetSchema);