import { v2 as cloudinary } from "cloudinary";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";
// ==========================================
// Upload image to Cloudinary
// ==========================================
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "QuickDine",
        }, (error, result) => {
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
        });
        stream.end(fileBuffer);
    });
};
// ==========================================
// GET OWNER RESTAURANT
// GET /api/owner/restaurant
// ==========================================
export const getOwnerRestaurant = async (req, res) => {
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
        // Owner has not created restaurant yet
        if (!restaurant) {
            res.status(200).json(null);
            return;
        }
        res.status(200).json(restaurant);
    }
    catch (error) {
        console.error("Get Owner Restaurant Error:", error);
        res.status(500).json({
            message: error?.message ||
                "Server error",
        });
    }
};
// ==========================================
// CREATE OWNER RESTAURANT
// POST /api/owner/restaurant
// ==========================================
export const createOwnerRestaurant = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }
        // ==========================================
        // Check existing restaurant
        // ==========================================
        const existing = await Restaurant.findOne({
            owner: req.user._id,
        });
        if (existing) {
            res.status(400).json({
                message: "You already have a restaurant registered",
            });
            return;
        }
        // ==========================================
        // Get form data
        // ==========================================
        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats, } = req.body;
        // ==========================================
        // Validate required fields
        // ==========================================
        if (!name?.trim() ||
            !description?.trim() ||
            !cuisine?.trim() ||
            !priceRange ||
            !location?.trim() ||
            !address?.trim() ||
            !chef?.trim()) {
            res.status(400).json({
                message: "Please provide all required fields",
            });
            return;
        }
        // ==========================================
        // Generate slug
        // ==========================================
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        if (!slug) {
            res.status(400).json({
                message: "Invalid restaurant name",
            });
            return;
        }
        // ==========================================
        // Check duplicate slug
        // ==========================================
        const slugExists = await Restaurant.findOne({
            slug,
        });
        if (slugExists) {
            res.status(400).json({
                message: "A restaurant with this name already exists",
            });
            return;
        }
        // ==========================================
        // Upload image
        // ==========================================
        let imageUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl =
                result.secure_url;
        }
        // ==========================================
        // Parse tags
        // ==========================================
        const parsedTags = typeof tags === "string"
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : Array.isArray(tags)
                ? tags
                : [];
        // ==========================================
        // Parse available slots
        // ==========================================
        const parsedSlots = typeof availableSlots === "string"
            ? availableSlots
                .split(",")
                .map((slot) => slot.trim())
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
        // Parse seats
        // ==========================================
        let seats = 20;
        if (totalSeats !== undefined &&
            totalSeats !== "") {
            seats = Number(totalSeats);
            if (!Number.isInteger(seats) ||
                seats < 1) {
                res.status(400).json({
                    message: "totalSeats must be a valid number greater than 0",
                });
                return;
            }
        }
        // ==========================================
        // Create restaurant
        // ==========================================
        const restaurant = await Restaurant.create({
            name: name.trim(),
            slug,
            description: description.trim(),
            cuisine: cuisine.trim(),
            priceRange,
            location: location.trim(),
            address: address.trim(),
            chef: chef.trim(),
            image: imageUrl,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats: seats,
            owner: req.user._id,
            // Important:
            // New restaurant needs admin approval
            status: "pending",
        });
        // ==========================================
        // Response
        // ==========================================
        res.status(201).json({
            message: "Restaurant created successfully and submitted for approval",
            restaurant,
        });
    }
    catch (error) {
        console.error("Create Owner Restaurant Error:", error);
        res.status(500).json({
            message: error?.message ||
                "Server error",
        });
    }
};
// ==========================================
// UPDATE OWNER RESTAURANT
// PUT /api/owner/restaurant
// ==========================================
export const updateOwnerRestaurant = async (req, res) => {
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
        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats, } = req.body;
        // ==========================================
        // Name / Slug
        // ==========================================
        if (typeof name === "string" &&
            name.trim()) {
            const cleanName = name.trim();
            const newSlug = cleanName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            const slugExists = await Restaurant.findOne({
                slug: newSlug,
                _id: {
                    $ne: restaurant._id,
                },
            });
            if (slugExists) {
                res.status(400).json({
                    message: "A restaurant with this name already exists",
                });
                return;
            }
            restaurant.name =
                cleanName;
            restaurant.slug =
                newSlug;
        }
        // ==========================================
        // Basic fields
        // ==========================================
        if (typeof description ===
            "string") {
            restaurant.description =
                description.trim();
        }
        if (typeof cuisine === "string") {
            restaurant.cuisine =
                cuisine.trim();
        }
        if (priceRange) {
            restaurant.priceRange =
                priceRange;
        }
        if (typeof location === "string") {
            restaurant.location =
                location.trim();
        }
        if (typeof address === "string") {
            restaurant.address =
                address.trim();
        }
        if (typeof chef === "string") {
            restaurant.chef =
                chef.trim();
        }
        // ==========================================
        // Total seats
        // ==========================================
        if (totalSeats !== undefined &&
            totalSeats !== "") {
            const seats = Number(totalSeats);
            if (!Number.isInteger(seats) ||
                seats < 1) {
                res.status(400).json({
                    message: "totalSeats must be a valid number greater than 0",
                });
                return;
            }
            restaurant.totalSeats =
                seats;
        }
        // ==========================================
        // Tags
        // ==========================================
        if (tags !== undefined) {
            restaurant.tags =
                typeof tags === "string"
                    ? tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    : Array.isArray(tags)
                        ? tags
                        : [];
        }
        // ==========================================
        // Available slots
        // ==========================================
        if (availableSlots !== undefined) {
            restaurant.availableSlots =
                typeof availableSlots ===
                    "string"
                    ? availableSlots
                        .split(",")
                        .map((slot) => slot.trim())
                        .filter(Boolean)
                    : Array.isArray(availableSlots)
                        ? availableSlots
                        : [];
        }
        // ==========================================
        // New image
        // ==========================================
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            restaurant.image =
                result.secure_url;
        }
        // ==========================================
        // Save
        // ==========================================
        const updatedRestaurant = await restaurant.save();
        res.status(200).json({
            message: "Restaurant updated successfully",
            restaurant: updatedRestaurant,
        });
    }
    catch (error) {
        console.error("Update Owner Restaurant Error:", error);
        res.status(500).json({
            message: error?.message ||
                "Server error",
        });
    }
};
// ==========================================
// GET OWNER BOOKINGS
// GET /api/owner/bookings
// ==========================================
export const getOwnerBookings = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }
        // Find owner's restaurant
        const restaurant = await Restaurant.findOne({
            owner: req.user._id,
        });
        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant profile not found",
            });
            return;
        }
        // Find bookings
        const bookings = await Booking.find({
            restaurant: restaurant._id,
        })
            .populate("user", "name email phone")
            .populate("restaurant", "name location image address")
            .sort({
            date: -1,
            time: -1,
        });
        res.status(200).json({
            count: bookings.length,
            bookings,
        });
    }
    catch (error) {
        console.error("Get Owner Bookings Error:", error);
        res.status(500).json({
            message: error?.message ||
                "Server error",
        });
    }
};
// ==========================================
// UPDATE BOOKING STATUS
// PUT /api/owner/bookings/:id/status
// ==========================================
export const updateBookingStatus = async (req, res) => {
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
        if (!status ||
            !validStatuses.includes(status)) {
            res.status(400).json({
                message: "Please provide a valid booking status",
            });
            return;
        }
        // ==========================================
        // Find booking
        // ==========================================
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({
                message: "Booking not found",
            });
            return;
        }
        // ==========================================
        // Find restaurant
        // ==========================================
        const restaurant = await Restaurant.findById(booking.restaurant);
        if (!restaurant) {
            res.status(404).json({
                message: "Restaurant not found",
            });
            return;
        }
        // ==========================================
        // Check ownership
        // ==========================================
        if (restaurant.owner.toString() !==
            req.user._id.toString()) {
            res.status(403).json({
                message: "Not authorized to manage this booking",
            });
            return;
        }
        // ==========================================
        // Update status
        // ==========================================
        booking.status =
            status;
        await booking.save();
        // Populate restaurant
        const updatedBooking = await booking.populate("restaurant", "name location image address slug");
        res.status(200).json({
            message: "Booking status updated successfully",
            booking: updatedBooking,
        });
    }
    catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({
            message: error?.message ||
                "Server error",
        });
    }
};
