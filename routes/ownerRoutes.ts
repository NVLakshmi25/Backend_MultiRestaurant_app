import { Router } from "express";

import {
    createOwnerRestaurant,
    getOwnerBookings,
    getOwnerRestaurant,
    updateBookingStatus,
    updateOwnerRestaurant,
} from "../controllers/ownerController.js";

import upload from "../config/multer.js";

import {
    ownerOnly,
    protect,
} from "../middlewares/authMiddleware.js";

const ownerRouter = Router();

// ==========================================
// All owner routes require authentication
// ==========================================

ownerRouter.use(protect);

// ==========================================
// All owner routes require owner/admin role
// ==========================================

ownerRouter.use(ownerOnly);

// ==========================================
// Restaurant routes
// ==========================================

ownerRouter.get(
    "/restaurant",
    getOwnerRestaurant
);

ownerRouter.post(
    "/restaurant",
    upload.single("image"),
    createOwnerRestaurant
);

ownerRouter.put(
    "/restaurant",
    upload.single("image"),
    updateOwnerRestaurant
);

// ==========================================
// Booking routes
// ==========================================

ownerRouter.get(
    "/bookings",
    getOwnerBookings
);

ownerRouter.put(
    "/bookings/:id/status",
    updateBookingStatus
);

export default ownerRouter;