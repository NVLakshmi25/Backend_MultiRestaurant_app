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


const app = express();


// ==========================================
// Connect MongoDB
// ==========================================

await connectDB();


// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// Port
// ==========================================

const port = process.env.PORT || 5000;


// ==========================================
// Home route
// ==========================================

app.get(
    "/",
    (req: Request, res: Response) => {
        res.send("Server is Live!");
    }
);


// ==========================================
// Auth routes
// ==========================================

app.use(
    "/api/auth",
    authRouter
);
// ------------------------------------------------------
app.use("/api/auth", authRouter)
app.use("/api/restaurants", restaurantRouter)
app.use("/api/bookings", bookingRouter)


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
// Start server
// ==========================================

app.listen(
    port,
    () => {
        console.log(
            `Server is running at http://localhost:${port}`
        );
    }
);