import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { User } from "./models/User.js";
import { Restaurant } from "./models/Restaurant.js";
import { Booking } from "./models/Booking.js";

import restaurantsData from "./Data/restaurantsData.js" 

// ==========================================
// MongoDB URI
// ==========================================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error(
        "MONGO_URI is not defined in .env file"
    );
}

// ==========================================
// Seed Database
// ==========================================

const seedData = async (): Promise<void> => {
    try {
        // ==========================================
        // Connect to MongoDB
        // ==========================================

        console.log(
            "Connecting to database for seeding..."
        );

        await mongoose.connect(MONGO_URI);

        console.log(
            "Database connected successfully."
        );

        // ==========================================
        // Clear Existing Data
        // ==========================================

        console.log(
            "Clearing existing collections..."
        );

        await Booking.deleteMany({});
        await Restaurant.deleteMany({});
        await User.deleteMany({});

        console.log(
            "Existing data cleared."
        );

        // ==========================================
        // Create Passwords
        // ==========================================

        console.log(
            "Creating default users..."
        );

        const salt = await bcrypt.genSalt(10);

        const adminPassword =
            await bcrypt.hash(
                "admin123",
                salt
            );

        const userPassword =
            await bcrypt.hash(
                "user123",
                salt
            );

        const ownerPassword =
            await bcrypt.hash(
                "owner123",
                salt
            );

        // ==========================================
        // Create Admin
        // ==========================================

        const adminUser = await User.create({
            name: "Alex Mercer",
            email: "admin@example.com",
            password: adminPassword,
            phone: "+01234567788",
            role: "admin",
        });

        console.log(
            `Admin created: ${adminUser.email}`
        );

        // ==========================================
        // Create Normal User
        // ==========================================

        const testUser = await User.create({
            name: "Sarah Jenkins",
            email: "user@example.com",
            password: userPassword,
            phone: "+01234567789",
            role: "user",
        });

        console.log(
            `User created: ${testUser.email}`
        );

        // ==========================================
        // Create Restaurant Owner
        // ==========================================

        const ownerUser = await User.create({
            name: "Marc Dubois",
            email: "owner@example.com",
            password: ownerPassword,
            phone: "+01234567790",
            role: "owner",
        });

        console.log(
            `Owner created: ${ownerUser.email}`
        );

        // ==========================================
        // Create Restaurants
        // ==========================================

        console.log(
            "Creating restaurants..."
        );

        const updatedRestaurantsData =
            restaurantsData.map(
                (restaurant, index) => ({
                    ...restaurant,

                    owner: ownerUser._id,

                    status: "approved",

                    totalSeats:
                        20 + index * 5,
                })
            );

        const restaurants =
            await Restaurant.insertMany(
                updatedRestaurantsData
            );

        console.log(
            `${restaurants.length} restaurants created.`
        );

        // ==========================================
        // Create Sample Booking
        // ==========================================

        console.log(
            "Creating sample booking..."
        );

        if (restaurants.length > 0) {
            const sampleRestaurant =
                restaurants[0];

            await Booking.create({
                user: testUser._id,

                restaurant:
                    sampleRestaurant._id,

                date: new Date(
                    "2026-09-15"
                ),

                time: "19:00",

                guests: 2,

                occasion: "Birthday",

                specialRequests:
                    "Window table if available",

                status: "confirmed",
            });

            console.log(
                "Sample booking created."
            );
        }

        // ==========================================
        // Seed Complete
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            "Database seeding completed successfully!"
        );

        console.log(
            "=========================================="
        );

        console.log("");
        console.log(
            "Login credentials:"
        );

        console.log(
            "Admin: admin@example.com / admin123"
        );

        console.log(
            "User: user@example.com / user123"
        );

        console.log(
            "Owner: owner@example.com / owner123"
        );
    } catch (error) {
        console.error(
            "Seeding failed:",
            error
        );

        process.exitCode = 1;
    } finally {
        // ==========================================
        // Disconnect MongoDB
        // ==========================================

        await mongoose.disconnect();

        console.log(
            "Disconnected from database."
        );
    }
};

// ==========================================
// Run Seeder
// ==========================================

seedData();