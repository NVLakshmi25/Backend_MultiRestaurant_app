import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRouter from "./routes/AuthRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";


// ==========================================
// Create Express App
// ==========================================

const app = express();


// ==========================================
// Connect MongoDB
// ==========================================

await connectDB();


// ==========================================
// Global Middleware
// ==========================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://multi-restaurant-booking-app-froten.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {

            // Allow requests without an origin
            // Example: Postman or server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            // Allow only trusted frontend origins
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Reject unknown origins
            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true,
    })
);

app.use(express.json());


// ==========================================
// Port
// ==========================================

const port = process.env.PORT || 5000;


// ==========================================
// Home Route
// ==========================================

app.get(
    "/",
    (_req, res) => {
        res.status(200).send(
            "Server is Live!"
        );
    }
);


// ==========================================
// Auth Routes
// ==========================================

app.use(
    "/api/auth",
    authRouter
);


// ==========================================
// User Routes
// ==========================================

app.use(
    "/api/users",
    userRouter
);


// ==========================================
// Restaurant Routes
// ==========================================

app.use(
    "/api/restaurants",
    restaurantRouter
);


// ==========================================
// Booking Routes
// ==========================================

app.use(
    "/api/bookings",
    bookingRouter
);


// ==========================================
// Owner Routes
// ==========================================

app.use(
    "/api/owner",
    ownerRouter
);


// ==========================================
// Admin Routes
// ==========================================

app.use(
    "/api/admin",
    adminRouter
);


// ==========================================
// 404 Route
// ==========================================

app.use(
    (_req, res) => {
        res.status(404).json({
            message: "API route not found",
        });
    }
);


// ==========================================
// Global Error Handler
// ==========================================

app.use(
    (err, _req, res, _next) => {

        console.error(
            "Unhandled Error:",
            err
        );

        res.status(500).json({
            message:
                err.message ||
                "Internal Server Error",

            stack:
                process.env.NODE_ENV ===
                "production"
                    ? undefined
                    : err.stack,
        });
    }
);


// ==========================================
// Start Server
// ==========================================

app.listen(
    port,
    "0.0.0.0",
    () => {
        console.log(
            `Server is running on port ${port}`
        );
    }
);