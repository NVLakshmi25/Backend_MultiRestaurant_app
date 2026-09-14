import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// ==========================================
// Get all approved restaurants
// GET /api/restaurants
// ==========================================

export const getRestaurants = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            search,
            priceRange,
            rating,
            location,
            sort,
        } = req.query;

        // Only approved restaurants
        const queryObj: any = {
            status: "approved",
        };

        // Search
        if (search) {
            queryObj.$or = [
                {
                    name: {
                        $regex: search as string,
                        $options: "i",
                    },
                },
                {
                    tags: {
                        $regex: search as string,
                        $options: "i",
                    },
                },
                {
                    location: {
                        $regex: search as string,
                        $options: "i",
                    },
                },
            ];
        }

        // Price range filter
        if (priceRange) {
            const prices = Array.isArray(priceRange)
                ? priceRange
                : [priceRange];

            queryObj.priceRange = {
                $in: prices,
            };
        }

        // Rating filter
        if (rating) {
            const ratingNumber = parseFloat(
                rating as string
            );

            if (!isNaN(ratingNumber)) {
                queryObj.rating = {
                    $gte: ratingNumber,
                };
            }
        }

        // Location filter
        if (location) {
            queryObj.location = {
                $regex: location as string,
                $options: "i",
            };
        }

        // Sorting
        let sortOption: any = {
            createdAt: -1,
        };

        if (sort === "rating") {
            sortOption = {
                rating: -1,
            };
        } else if (sort === "price_low") {
            sortOption = {
                priceRange: 1,
            };
        } else if (sort === "price_high") {
            sortOption = {
                priceRange: -1,
            };
        }

        // Get restaurants
        const restaurants = await Restaurant
            .find(queryObj)
            .sort(sortOption);

        res.status(200).json(restaurants);
    } catch (error: any) {
        console.error(
            "Get Restaurants Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Get featured and exclusive restaurants
// GET /api/restaurants/featured
// ==========================================

export const getFeaturedRestaurants = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const restaurants = await Restaurant
            .find({
                status: "approved",
                $or: [
                    { featured: true },
                    { exclusive: true },
                ],
            })
            .limit(6);

        res.status(200).json(restaurants);
    } catch (error: any) {
        console.error(
            "Get Featured Restaurants Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Get restaurant by slug
// GET /api/restaurants/:slug
// ==========================================

export const getRestaurantBySlug = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const restaurant =
            await Restaurant.findOne({
                slug: req.params.slug,
            });

        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant not found",
            });
            return;
        }

        // Approved restaurant can be viewed by everyone
        if (restaurant.status === "approved") {
            res.status(200).json(restaurant);
            return;
        }

        // Pending/rejected restaurant
        // can only be viewed by owner/admin
        let isAuthorized = false;

        const authorization =
            req.headers.authorization;

        if (
            authorization &&
            authorization.startsWith("Bearer ")
        ) {
            try {
                const token =
                    authorization.split(" ")[1];

                const secret =
                    process.env.JWT_SECRET;

                if (!secret) {
                    res.status(500).json({
                        message:
                            "JWT_SECRET is not configured",
                    });
                    return;
                }

                const decoded = jwt.verify(
                    token,
                    secret
                ) as { id: string };

                const user =
                    await User.findById(decoded.id);

                if (
                    user &&
                    (
                        user.role === "admin" ||
                        (
                            user.role === "owner" &&
                            restaurant.owner
                                .toString() ===
                                user._id.toString()
                        )
                    )
                ) {
                    isAuthorized = true;
                }
            } catch (error) {
                console.error(
                    "Token verification failed:",
                    error
                );
            }
        }

        if (!isAuthorized) {
            res.status(404).json({
                message:
                    "Restaurant not found or pending approval",
            });
            return;
        }

        res.status(200).json(restaurant);
    } catch (error: any) {
        console.error(
            "Get Restaurant By Slug Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};

// ==========================================
// Get restaurant seat availability
// GET /api/restaurants/:id/availability
// ==========================================

export const getRestaurantAvailability = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { date } = req.query;

        // Check date
        if (!date) {
            res.status(400).json({
                message: "Please provide a date",
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
                message: "Restaurant not found",
            });
            return;
        }

        // Convert date
        const bookingDate = new Date(
            date as string
        );

        // Validate date
        if (isNaN(bookingDate.getTime())) {
            res.status(400).json({
                message: "Invalid date",
            });
            return;
        }

        // Start of selected day
        const startOfDay = new Date(
            bookingDate
        );

        startOfDay.setHours(
            0,
            0,
            0,
            0
        );

        // End of selected day
        const endOfDay = new Date(
            bookingDate
        );

        endOfDay.setHours(
            23,
            59,
            59,
            999
        );

        // Get all confirmed bookings
        // for this restaurant and date
        const bookings = await Booking.find({
            restaurant: restaurant._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            status: "confirmed",
        });

        // Total seats
        const totalSeats =
            restaurant.totalSeats || 20;

        // Calculate availability for every slot
        const availability =
            restaurant.availableSlots.map(
                (slot) => {
                    // Find bookings for this slot
                    const bookedSeats =
                        bookings
                            .filter(
                                (booking) =>
                                    booking.time ===
                                    slot
                            )
                            .reduce(
                                (
                                    total,
                                    booking
                                ) =>
                                    total +
                                    booking.guests,
                                0
                            );

                    // Available seats
                    const availableSeats =
                        Math.max(
                            0,
                            totalSeats -
                                bookedSeats
                        );

                    return {
                        time: slot,
                        totalSeats,
                        bookedSeats,
                        availableSeats,
                        isAvailable:
                            availableSeats > 0,
                    };
                }
            );

        // Send response
        res.status(200).json({
            restaurantId:
                restaurant._id,
            restaurantName:
                restaurant.name,
            date: date,
            totalSeats,
            slots: availability,
        });
    } catch (error: any) {
        console.error(
            "Get Restaurant Availability Error:",
            error
        );

        res.status(500).json({
            message:
                error.message || "Server error",
        });
    }
};