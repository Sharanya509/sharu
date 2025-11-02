// server/config/db.js

const mongoose = require('mongoose');

/**
 * Connects the application to the MongoDB Atlas cluster using the URI 
 * defined in the .env file (MONGO_URI).
 */
const connectDB = async () => {
    try {
        // Ensure the URI is available; process.env variables are loaded 
        // by requiring 'dotenv' in server.js before calling connectDB.
        const uri = process.env.MONGO_URI;

        if (!uri) {
            console.error("FATAL ERROR: MONGO_URI is not defined in the environment variables.");
            process.exit(1);
        }

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Atlas Connection Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;