// server/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' }); // Ensure .env is loaded

// --- Load Models ---
const connectDB = require('./config/db'); // Your existing DB connection function
const User = require('./models/user.model');

// --- Seed Data ---
const seedUsers = [
    {
        employeeId: "A001",
        name: "Super Admin",
        email: "admin@sharu.com",
        password: "admin123", // Will be hashed
        role: "Admin",
        managerId: null,
    },
    {
        employeeId: "E101",
        name: "Test Employee",
        email: "test@employee.com",
        password: "employee123", // Will be hashed
        role: "Employee",
        managerId: null, // Link to Admin's _id if needed later
    }
];

// --- Main Seeding Function ---
const importData = async () => {
    try {
        await connectDB();

        console.log("Database connected. Starting data import...");

        // 1. Clear existing users to prevent duplication
        await User.deleteMany();
        console.log("Existing users cleared.");

        // 2. Hash passwords for all seed users
        const hashedUsers = [];
        for (const user of seedUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            // Create a new user object with the hashed password
            hashedUsers.push({
                ...user,
                password: hashedPassword,
            });
        }

        // 3. Insert users into MongoDB Atlas
        await User.insertMany(hashedUsers);

        console.log("Data successfully imported!");
        console.log(`Admin Login: admin@sharu.com / adminpass123`);
        console.log(`Employee Login: test@employee.com / employeepass123`);

        // 4. Optionally, update the Employee's managerId to the new Admin's _id
        const adminUser = await User.findOne({ role: 'Admin' });
        if (adminUser) {
            await User.updateMany(
                { role: 'Employee', managerId: null },
                { $set: { managerId: adminUser._id } }
            );
            console.log(`Updated Employee managerId to Admin: ${adminUser.name}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error during data import:", error);
        process.exit(1);
    }
};

// Execute the function
importData();