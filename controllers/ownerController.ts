import { Response } from "express";
import { v2 as cloudinary } from "cloudinary";

import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";

// ==========================================
// Upload image to Cloudinary
// ==========================================

const uploadToCloudinary = (
    fileBuffer: Buffer
): Promise<{ secure_url: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "QuickDine",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary upload failed"));
                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                });
            }
        );

        stream.end(fileBuffer);
    });
};

// ==========================================
// Get owner's restaurant
// GET /api/owner/restaurant
// Protected: Owner/Admin
// ==========================================

export const getOwnerRestaurant = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        const restaurant = await Restaurant.findOne({
            owner: req.user._id,
        });

        if (!restaurant) {
            res.status(200).json(null);
            return;
        }

        res.status(200).json(restaurant);
    } catch (error: any) {
        console.error("Get Owner Restaurant Error:", error);

        res.status(500).json({
            message: error.message || "Server error",
        });
    }
};

// ==========================================
// Create owner's restaurant
// POST /api/owner/restaurant
// Protected: Owner/Admin
// ==========================================

export const createOwnerRestaurant = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        // Check if owner already has a restaurant
        const existing = await Restaurant.findOne({
            owner: req.user._id,
        });

        if (existing) {
            res.status(400).json({
                message:
                    "You already have a restaurant registered",
            });
            return;
        }

        const {
            name,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            tags,
            availableSlots,
            totalSeats,
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !description ||
            !cuisine ||
            !priceRange ||
            !location ||
            !address ||
            !chef
        ) {
            res.status(400).json({
                message:
                    "Please provide all required fields",
            });
            return;
        }

        // Generate slug
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // Check slug
        const slugExists = await Restaurant.findOne({
            slug,
        });

        if (slugExists) {
            res.status(400).json({
                message:
                    "A restaurant with this name already exists",
            });
            return;
        }

        // ==========================================
        // Upload image
        // ==========================================

        let imageUrl = "";

        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer
            );

            imageUrl = result.secure_url;
        }

        // ==========================================
        // Parse tags
        // ==========================================

        const parsedTags =
            typeof tags === "string"
                ? tags
                      .split(",")
                      .map((tag: string) => tag.trim())
                      .filter(Boolean)
                : Array.isArray(tags)
                ? tags
                : [];

        // ==========================================
        // Parse available slots
        // ==========================================

        const parsedSlots =
            typeof availableSlots === "string"
                ? availableSlots
                      .split(",")
                      .map((slot: string) => slot.trim())
                      .filter(Boolean)
                : Array.isArray(availableSlots)
                ? availableSlots
                : [
                      "17:00",
                      "18:00",
                      "19:00",
                      "20:00",
                      "21:00",
                  ];

        // ==========================================
        // Create restaurant
        // ==========================================

        const restaurant = await Restaurant.create({
            name: name.trim(),
            slug,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            image: imageUrl,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats: totalSeats
                ? Number(totalSeats)
                : 20,
            owner: req.user._id,
            status: "pending",
        });

        res.status(201).json({
            message:
                "Restaurant created successfully and submitted for approval",
            restaurant,
        });
    } catch (error: any) {
        console.error(
            "Create Owner Restaurant Error:",
            error
        );

        res.status(500).json({
            message: error.message || "Server error",
        });
    }
};

// ==========================================
// Update owner's restaurant
// PUT /api/owner/restaurant
// Protected: Owner/Admin
// ==========================================

export const updateOwnerRestaurant = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        const restaurant = await Restaurant.findOne({
            owner: req.user._id,
        });

        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant profile not found",
            });
            return;
        }

        const {
            name,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            tags,
            availableSlots,
            totalSeats,
        } = req.body;

        if (name) {
            restaurant.name = name.trim();

            const newSlug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            const slugExists = await Restaurant.findOne({
                slug: newSlug,
                _id: { $ne: restaurant._id },
            });

            if (slugExists) {
                res.status(400).json({
                    message:
                        "A restaurant with this name already exists",
                });
                return;
            }

            restaurant.slug = newSlug;
        }

        if (description) {
            restaurant.description = description;
        }

        if (cuisine) {
            restaurant.cuisine = cuisine;
        }

        if (priceRange) {
            restaurant.priceRange = priceRange;
        }

        if (location) {
            restaurant.location = location;
        }

        if (address) {
            restaurant.address = address;
        }

        if (chef) {
            restaurant.chef = chef;
        }

        if (totalSeats !== undefined) {
            const seats = Number(totalSeats);

            if (!Number.isInteger(seats) || seats < 1) {
                res.status(400).json({
                    message:
                        "totalSeats must be a valid number greater than 0",
                });
                return;
            }

            restaurant.totalSeats = seats;
        }

        // Update tags
        if (tags !== undefined) {
            restaurant.tags =
                typeof tags === "string"
                    ? tags
                          .split(",")
                          .map((tag: string) => tag.trim())
                          .filter(Boolean)
                    : Array.isArray(tags)
                    ? tags
                    : [];
        }

        // Update available slots
        if (availableSlots !== undefined) {
            restaurant.availableSlots =
                typeof availableSlots === "string"
                    ? availableSlots
                          .split(",")
                          .map((slot: string) => slot.trim())
                          .filter(Boolean)
                    : Array.isArray(availableSlots)
                    ? availableSlots
                    : [];
        }

        // ==========================================
        // Upload new image
        // ==========================================

        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer
            );

            restaurant.image = result.secure_url;
        }

        const updatedRestaurant =
            await restaurant.save();

        res.status(200).json({
            message:
                "Restaurant updated successfully",
            restaurant: updatedRestaurant,
        });
    } catch (error: any) {
        console.error(
            "Update Owner Restaurant Error:",
            error
        );

        res.status(500).json({
            message: error.message || "Server error",
        });
    }
};

// ==========================================
// Get owner's bookings
// GET /api/owner/bookings
// Protected: Owner/Admin
// ==========================================

export const getOwnerBookings = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        const restaurant = await Restaurant.findOne({
            owner: req.user._id,
        });

        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant profile not found",
            });
            return;
        }

        const bookings = await Booking.find({
            restaurant: restaurant._id,
        })
            .populate(
                "user",
                "name email phone"
            )
            .populate(
                "restaurant",
                "name location image address"
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
            "Get Owner Bookings Error:",
            error
        );

        res.status(500).json({
            message: error.message || "Server error",
        });
    }
};

// ==========================================
// Update booking status
// PUT /api/owner/bookings/:id/status
// Protected: Owner/Admin
// ==========================================

export const updateBookingStatus = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }

        const { status } = req.body;

        const validStatuses = [
            "confirmed",
            "cancelled",
            "completed",
        ];

        if (
            !status ||
            !validStatuses.includes(status)
        ) {
            res.status(400).json({
                message:
                    "Please provide a valid booking status",
            });
            return;
        }

        const booking = await Booking.findById(
            req.params.id
        );

        if (!booking) {
            res.status(404).json({
                message: "Booking not found",
            });
            return;
        }

        // Find restaurant
        const restaurant = await Restaurant.findById(
            booking.restaurant
        );

        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant not found",
            });
            return;
        }

        // Check ownership
        if (
            restaurant.owner.toString() !==
            req.user._id.toString()
        ) {
            res.status(403).json({
                message:
                    "Not authorized to manage this booking",
            });
            return;
        }

        booking.status = status;

        await booking.save();

        const updatedBooking =
            await booking.populate(
                "restaurant",
                "name location image address slug"
            );

        res.status(200).json({
            message:
                "Booking status updated successfully",
            booking: updatedBooking,
        });
    } catch (error: any) {
        console.error(
            "Update Booking Status Error:",
            error
        );

        res.status(500).json({
            message: error.message || "Server error",
        });
    }
};