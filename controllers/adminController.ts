import { Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// ==========================================
// Get all restaurants
// GET /api/admin/restaurants
// Protected: Admin only
// ==========================================

export const getAllRestaurants = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const restaurants = await Restaurant.find({})
            .populate("owner", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: restaurants.length,
            restaurants,
        });
    } catch (error: any) {
        console.error(
            "Get All Restaurants Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Approve / Reject Restaurant
// PUT /api/admin/restaurants/:id/approve
// Protected: Admin only
// ==========================================

export const approveRestaurant = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { status } = req.body;

        // Validate status
        if (
            !status ||
            ![
                "approved",
                "rejected",
                "pending",
            ].includes(status)
        ) {
            res.status(400).json({
                message:
                    "Please provide a valid restaurant status: approved, rejected, or pending",
            });
            return;
        }

        // Find restaurant
        const restaurant =
            await Restaurant.findById(
                req.params.id
            );

        if (!restaurant) {
            res.status(404).json({
                message:
                    "Restaurant profile not found",
            });
            return;
        }

        // Update status
        restaurant.status = status;

        await restaurant.save();

        res.status(200).json({
            message:
                `Restaurant ${status} successfully`,
            restaurant,
        });
    } catch (error: any) {
        console.error(
            "Approve Restaurant Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Get Admin Statistics
// GET /api/admin/stats
// Protected: Admin only
// ==========================================

export const getAdminStats = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        // Count users
        const totalUsers =
            await User.countDocuments({
                role: "user",
            });

        // Count owners
        const totalOwners =
            await User.countDocuments({
                role: "owner",
            });

        // Count bookings
        const totalBookings =
            await Booking.countDocuments({});

        // Count restaurants
        const totalRestaurants =
            await Restaurant.countDocuments({});

        // Count restaurant statuses
        const approvedRestaurants =
            await Restaurant.countDocuments({
                status: "approved",
            });

        const pendingRestaurants =
            await Restaurant.countDocuments({
                status: "pending",
            });

        const rejectedRestaurants =
            await Restaurant.countDocuments({
                status: "rejected",
            });

        // Latest 10 bookings
        const latestBookings =
            await Booking.find({})
                .populate(
                    "user",
                    "name email"
                )
                .populate(
                    "restaurant",
                    "name"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(10);

        res.status(200).json({
            users: {
                totalUsers,
                totalOwners,
                total:
                    totalUsers +
                    totalOwners,
            },

            restaurants: {
                total: totalRestaurants,
                approved:
                    approvedRestaurants,
                pending:
                    pendingRestaurants,
                rejected:
                    rejectedRestaurants,
            },

            bookings: {
                total: totalBookings,
            },

            latestBookings,
        });
    } catch (error: any) {
        console.error(
            "Get Admin Stats Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};