// server/server.js

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db'); // Database connection function

// --- ROUTERS ---
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const port = process.env.PORT || 3000;

// --- 1. DATABASE CONNECTION ---
connectDB();

// --- 2. GLOBAL MIDDLEWARE ---
// Set CORS options (Adjust origin for production security)
const corsOptions = {
    origin: '*', // Allow all origins for development/simple deployment. Change this for security.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Body parser for JSON data
app.use(express.json());


// --- 3. API ROUTE MOUNTING ---
// All API requests are prefixed with /api
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);

/* Commened out for deployment on Render.com
// --- 4. STATIC FILE SERVING (For Angular PWA) ---
// Define the path to the compiled Angular PWA output directory
const angularDistPath = path.join(__dirname, '../sharu/dist/sharu/browser');

// Serve static assets from the Angular build
app.use(express.static(angularDistPath));

// Middleware to handle unmatched routes for Angular
app.use((req, res, next) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(angularDistPath, 'index.html'));
    } else {
        next();
    }
});
*/
// --- 6. SERVER START ---
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});