import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware.js";

import { Booking } from "../models/Booking.js";

import { Restaurant } from "../models/Restaurant.js";

// ==========================================
// Create a new booking
// POST /api/bookings
// Protected
// ==========================================

export const createBooking = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        // Check logged-in user
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        const {
            restaurantId,
            date,
            time,
            guests,
            occasion,
            specialRequests,
        } = req.body;

        // Validate required fields
        if (
            !restaurantId ||
            !date ||
            !time ||
            !guests
        ) {
            res.status(400).json({
                message:
                    "Please provide all required reservation details",
            });
            return;
        }

        // Convert guests to number
        const requestedGuests = Number(guests);

        if (
            !Number.isInteger(requestedGuests) ||
            requestedGuests < 1
        ) {
            res.status(400).json({
                message:
                    "Guests must be a valid number greater than 0",
            });
            return;
        }

        // Validate date
        const bookingDate = new Date(date);

        if (isNaN(bookingDate.getTime())) {
            res.status(400).json({
                message: "Invalid booking date",
            });
            return;
        }

        // Check restaurant
        const restaurant =
            await Restaurant.findById(restaurantId);

        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant not found",
            });
            return;
        }

        // Check restaurant approval
        if (restaurant.status !== "approved") {
            res.status(400).json({
                message:
                    "Reservations are not open for this restaurant yet",
            });
            return;
        }

        // ==========================================
        // Check seat availability
        // ==========================================

        const existingBookings =
            await Booking.find({
                restaurant: restaurantId,
                date: bookingDate,
                time,
                status: "confirmed",
            });

        const bookedSeats =
            existingBookings.reduce(
                (sum, booking) =>
                    sum + booking.guests,
                0
            );

        const totalSeats =
            restaurant.totalSeats || 20;

        const availableSeats =
            totalSeats - bookedSeats;

        if (requestedGuests > availableSeats) {
            res.status(400).json({
                message: `Unable to reserve. Only ${availableSeats} seats are available for this time slot.`,
            });
            return;
        }

        // ==========================================
        // Create booking
        // ==========================================

        const booking = await Booking.create({
            user: req.user._id,
            restaurant: restaurantId,
            date: bookingDate,
            time,
            guests: requestedGuests,
            occasion,
            specialRequests,
            status: "confirmed",
        });

        // Populate restaurant information
        const populatedBooking =
            await booking.populate(
                "restaurant",
                "name location image address slug"
            );

        res.status(201).json({
            message: "Booking created successfully",
            booking: populatedBooking,
        });
    } catch (error: any) {
        console.error(
            "Create Booking Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Get logged-in user's bookings
// GET /api/bookings/my
// Protected
// ==========================================

export const getMyBookings = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        // Check logged-in user
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        const bookings =
            await Booking.find({
                user: req.user._id,
            })
                .populate(
                    "restaurant",
                    "name location image address slug"
                )
                .sort({
                    date: -1,
                    time: -1,
                });

        res.status(200).json({
            count: bookings.length,
            bookings,
        });
    } catch (error: any) {
        console.error(
            "Get My Bookings Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Cancel booking
// PUT /api/bookings/:id/cancel
// Protected
// ==========================================

export const cancelBooking = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        // Check logged-in user
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        // Find booking
        const booking =
            await Booking.findById(
                req.params.id
            );

        if (!booking) {
            res.status(404).json({
                message: "Booking not found",
            });
            return;
        }

        // Verify ownership
        if (
            booking.user.toString() !==
            req.user._id.toString()
        ) {
            res.status(403).json({
                message:
                    "Not authorized to cancel this booking",
            });
            return;
        }

        // Check current status
        if (booking.status === "cancelled") {
            res.status(400).json({
                message:
                    "Booking is already cancelled",
            });
            return;
        }

        if (booking.status === "completed") {
            res.status(400).json({
                message:
                    "Completed booking cannot be cancelled",
            });
            return;
        }

        // Cancel booking
        booking.status = "cancelled";

        await booking.save();

        // Populate restaurant
        const populatedBooking =
            await booking.populate(
                "restaurant",
                "name location image address slug"
            );

        res.status(200).json({
            message:
                "Booking cancelled successfully",
            booking: populatedBooking,
        });
    } catch (error: any) {
        console.error(
            "Cancel Booking Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};