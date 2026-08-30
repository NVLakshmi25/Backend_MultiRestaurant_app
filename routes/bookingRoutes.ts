import { Router } from "express";

import { protect } from "../middlewares/authMiddleware.js";

import {
    createBooking,
    getMyBookings,
    cancelBooking,
} from "../controllers/BookingController.js";

const bookingRouter = Router();

// Create booking
// POST /api/bookings
bookingRouter.post(
    "/",
    protect,
    createBooking
);

// Get logged-in user's bookings
// GET /api/bookings/my
bookingRouter.get(
    "/my",
    protect,
    getMyBookings
);

// Cancel booking
// PUT /api/bookings/:id/cancel
bookingRouter.put(
    "/:id/cancel",
    protect,
    cancelBooking
);

export default bookingRouter;