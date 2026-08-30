import { Router } from "express";

import {
    approveRestaurant,
    getAdminStats,
    getAllRestaurants,
} from "../controllers/adminController.js";

import {
    adminOnly,
    protect,
} from "../middlewares/authMiddleware.js";

const adminRouter = Router();

// ==========================================
// All admin routes require authentication
// ==========================================

adminRouter.use(protect);

// ==========================================
// All admin routes require admin role
// ==========================================

adminRouter.use(adminOnly);

// ==========================================
// Restaurant management
// ==========================================

// GET /api/admin/restaurants
adminRouter.get(
    "/restaurants",
    getAllRestaurants
);

// PUT /api/admin/restaurants/:id/approve
adminRouter.put(
    "/restaurants/:id/approve",
    approveRestaurant
);

// ==========================================
// Admin statistics
// ==========================================

// GET /api/admin/stats
adminRouter.get(
    "/stats",
    getAdminStats
);

export default adminRouter;