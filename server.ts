
import "dotenv/config";

import express, {
    NextFunction,
    Request,
    Response,
} from "express";

import cors from "cors";

import connectDB from "./config/db.js";

import authRouter from "./routes/AuthRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";


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

app.use(cors());

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
    (req: Request, res: Response) => {
        res.status(200).send("Server is Live!");
    }
);


// ==========================================
// Authentication Routes
// ==========================================

// Register
// POST /api/auth/register

// Login
// POST /api/auth/login

// Get current user
// GET /api/auth/me

app.use(
    "/api/auth",
    authRouter
);


// ==========================================
// User Routes
// ==========================================

// User profile
// GET /api/users/profile

// Admin route
// GET /api/users/admin

app.use(
    "/api/users",
    userRouter
);


// ==========================================
// Restaurant Routes
// ==========================================

// Get all restaurants
// GET /api/restaurants

// Get featured restaurants
// GET /api/restaurants/featured

// Get restaurant by slug
// GET /api/restaurants/:slug

// Get availability
// GET /api/restaurants/:id/availability

app.use(
    "/api/restaurants",
    restaurantRouter
);


// ==========================================
// Booking Routes
// ==========================================

// Create booking
// POST /api/bookings

// Get my bookings
// GET /api/bookings/my

// Cancel booking
// PUT /api/bookings/:id/cancel

app.use(
    "/api/bookings",
    bookingRouter
);
// ==========================================
// Owner routes
// ==========================================

app.use("/api/owner" , ownerRouter)


// ==========================================
// Global Error Handler
// ==========================================

app.use(
    (
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        console.error(
            "Unhandled Error:",
            err
        );

        res.status(500).json({
            message:
                err.message ||
                "Internal Server Error",

            stack:
                process.env.NODE_ENV === "production"
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
    () => {
        console.log(
            `Server is running at http://localhost:${port}`
        );
    }
);

