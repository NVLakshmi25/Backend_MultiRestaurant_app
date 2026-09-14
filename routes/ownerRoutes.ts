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
// Authentication
// ==========================================

ownerRouter.use(protect);

// ==========================================
// Owner / Admin authorization
// ==========================================

ownerRouter.use(ownerOnly);

// ==========================================
// Restaurant routes
// ==========================================

// GET /api/owner/restaurant
ownerRouter.get(
  "/restaurant",
  getOwnerRestaurant
);

// POST /api/owner/restaurant
ownerRouter.post(
  "/restaurant",
  upload.single("image"),
  createOwnerRestaurant
);

// PUT /api/owner/restaurant
ownerRouter.put(
  "/restaurant",
  upload.single("image"),
  updateOwnerRestaurant
);

// ==========================================
// Booking routes
// ==========================================

// GET /api/owner/bookings
ownerRouter.get(
  "/bookings",
  getOwnerBookings
);

// PUT /api/owner/bookings/:id/status
ownerRouter.put(
  "/bookings/:id/status",
  updateBookingStatus
);

export default ownerRouter;