import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";
/*
=====================================================
GET ALL RESTAURANTS
=====================================================

GET /api/admin/restaurants

Admin only.
*/
export const getAllRestaurants = async (req, res) => {
    try {
        /*
        Extra security check
        */
        if (req.user?.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
            return;
        }
        const restaurants = await Restaurant.find({})
            .populate("owner", "name email phone role")
            .sort({
            createdAt: -1,
        })
            .lean();
        res.status(200).json({
            success: true,
            count: restaurants.length,
            restaurants,
        });
    }
    catch (error) {
        console.error("Get All Restaurants Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch restaurants.",
        });
    }
};
/*
=====================================================
GET ADMIN DASHBOARD STATS
=====================================================

GET /api/admin/stats

Admin only.
*/
export const getAdminStats = async (req, res) => {
    try {
        /*
        Extra security check
        */
        if (req.user?.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
            return;
        }
        /*
        Get counts from database
        */
        const [totalUsers, totalRestaurants, pendingRestaurants, approvedRestaurants, rejectedRestaurants, totalBookings, confirmedBookings, cancelledBookings, completedBookings,] = await Promise.all([
            User.countDocuments(),
            Restaurant.countDocuments(),
            Restaurant.countDocuments({
                status: "pending",
            }),
            Restaurant.countDocuments({
                status: "approved",
            }),
            Restaurant.countDocuments({
                status: "rejected",
            }),
            Booking.countDocuments(),
            Booking.countDocuments({
                status: "confirmed",
            }),
            Booking.countDocuments({
                status: "cancelled",
            }),
            Booking.countDocuments({
                status: "completed",
            }),
        ]);
        /*
        Get latest bookings
        */
        const latestBookings = await Booking.find({})
            .populate({
            path: "user",
            select: "name email",
        })
            .populate({
            path: "restaurant",
            select: "name",
        })
            .sort({
            createdAt: -1,
        })
            .limit(10)
            .lean();
        /*
        Return dashboard statistics
        */
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalRestaurants,
                pendingRestaurants,
                approvedRestaurants,
                rejectedRestaurants,
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                completedBookings,
                latestBookings,
            },
        });
    }
    catch (error) {
        console.error("Get Admin Stats Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin statistics.",
        });
    }
};
/*
=====================================================
UPDATE RESTAURANT APPROVAL
=====================================================

PUT /api/admin/restaurants/:restaurantId/approve

Body:

{
    "status": "approved"
}

OR

{
    "status": "rejected"
}
*/
export const updateRestaurantApproval = async (req, res) => {
    try {
        /*
        1. Check admin permission
        */
        if (req.user?.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
            return;
        }
        /*
        2. Get restaurant ID
        */
        const restaurantId = String(req.params.restaurantId);
        if (!restaurantId) {
            res.status(400).json({
                success: false,
                message: "Restaurant ID is required.",
            });
            return;
        }
        /*
        3. Validate MongoDB ObjectId
        */
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            res.status(400).json({
                success: false,
                message: "Invalid restaurant ID.",
            });
            return;
        }
        /*
        4. Get status from request body
        */
        const { status } = req.body;
        /*
        5. Validate status
        */
        if (status !== "approved" &&
            status !== "rejected") {
            res.status(400).json({
                success: false,
                message: "Invalid status. Status must be approved or rejected.",
            });
            return;
        }
        /*
        6. Find restaurant
        */
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
            return;
        }
        /*
        7. Update restaurant status
        */
        restaurant.status = status;
        await restaurant.save();
        /*
        8. Return updated restaurant
        */
        res.status(200).json({
            success: true,
            message: `Restaurant has been marked as ${status}.`,
            restaurant,
        });
    }
    catch (error) {
        console.error("Update Restaurant Approval Error:", error);
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                message: error.message ||
                    "Failed to update restaurant approval status.",
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Failed to update restaurant approval status.",
        });
    }
};
/*
=====================================================
GET ALL USERS
=====================================================

GET /api/admin/users

Admin only.
*/
export const getAllUsers = async (req, res) => {
    try {
        /*
        Extra security check
        */
        if (req.user?.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
            return;
        }
        /*
        Get all users
        */
        const users = await User.find({})
            .select("-password")
            .sort({
            createdAt: -1,
        })
            .lean();
        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    }
    catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};
/*
=====================================================
UPDATE USER ROLE
=====================================================

PUT /api/admin/users/:userId/role

Body:

{
    "role": "owner"
}

Allowed roles:

"user"
"owner"
"admin"
*/
export const updateUserRole = async (req, res) => {
    try {
        /*
        1. Check admin permission
        */
        if (req.user?.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
            return;
        }
        /*
        2. Get user ID
        */
        const userId = String(req.params.userId);
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
            return;
        }
        /*
        3. Validate MongoDB ObjectId
        */
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
            return;
        }
        /*
        4. Get role from request body
        */
        const { role } = req.body;
        /*
        5. Allowed roles
        */
        const allowedRoles = [
            "user",
            "owner",
            "admin",
        ];
        if (!role ||
            !allowedRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: "Invalid role. Allowed roles are user, owner and admin.",
            });
            return;
        }
        /*
        6. Prevent admin from changing
           their own role
        */
        if (req.user._id.toString() ===
            userId) {
            res.status(400).json({
                success: false,
                message: "You cannot change your own role.",
            });
            return;
        }
        /*
        7. Find user
        */
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        /*
        8. Check if role is already same
        */
        if (user.role === role) {
            res.status(200).json({
                success: true,
                message: `User is already assigned the ${role} role.`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
            });
            return;
        }
        /*
        9. Update role
        */
        user.role =
            role;
        await user.save();
        /*
        10. Return updated user
        */
        res.status(200).json({
            success: true,
            message: `User role successfully changed to ${role}.`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Update User Role Error:", error);
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                message: error.message ||
                    "Failed to update user role.",
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Failed to update user role.",
        });
    }
};
