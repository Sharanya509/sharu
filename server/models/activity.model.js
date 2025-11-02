// server/models/activity.model.js (Updated)
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
        default: 'No additional details.'
    },
    hours: { // ⬅️ NEW FIELD
        type: Number,
        required: true,
        min: 0.5,
        max: 9.5
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', activitySchema);