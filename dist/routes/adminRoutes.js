import { Router } from "express";
import { getAllRestaurants, getAdminStats, updateRestaurantApproval, getAllUsers, updateUserRole, } from "../controllers/adminController.js";
import { protect, adminOnly, } from "../middlewares/authMiddleware.js";
const router = Router();
/*
=====================================================
RESTAURANT ADMIN ROUTES
=====================================================
*/
/**
 * GET /api/admin/restaurants
 *
 * Get all restaurants.
 * Admin only.
 */
router.get("/restaurants", protect, adminOnly, getAllRestaurants);
/**
 * GET /api/admin/stats
 *
 * Get admin dashboard statistics.
 * Admin only.
 */
router.get("/stats", protect, adminOnly, getAdminStats);
/**
 * PUT /api/admin/restaurants/:restaurantId/approve
 *
 * Approve or reject a restaurant.
 * Body:
 * {
 *     "status": "approved"
 * }
 *
 * OR
 *
 * {
 *     "status": "rejected"
 * }
 */
router.put("/restaurants/:restaurantId/approve", protect, adminOnly, updateRestaurantApproval);
/*
=====================================================
USER MANAGEMENT ROUTES
=====================================================
*/
/**
 * GET /api/admin/users
 *
 * Get all users.
 * Admin only.
 */
router.get("/users", protect, adminOnly, getAllUsers);
/**
 * PUT /api/admin/users/:userId/role
 *
 * Change user role.
 *
 * Body:
 * {
 *     "role": "owner"
 * }
 */
router.put("/users/:userId/role", protect, adminOnly, updateUserRole);
export default router;
