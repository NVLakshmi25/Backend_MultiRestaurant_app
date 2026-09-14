import { Router } from "express";

import {
    getFeaturedRestaurants,
    getRestaurantAvailability,
    getRestaurantBySlug,
    getRestaurants,
} from "../controllers/RestaurantController.js";

const restaurantRouter = Router();

// ==========================================
// Get all restaurants
// GET /api/restaurants
// ==========================================

restaurantRouter.get(
    "/",
    getRestaurants
);

// ==========================================
// Get featured restaurants
// GET /api/restaurants/featured
// ==========================================

restaurantRouter.get(
    "/featured",
    getFeaturedRestaurants
);

// ==========================================
// Get restaurant by slug
// GET /api/restaurants/:slug
// ==========================================

restaurantRouter.get(
    "/:slug",
    getRestaurantBySlug
);

// ==========================================
// Get restaurant availability
// GET /api/restaurants/:id/availability
// ==========================================

restaurantRouter.get(
    "/:id/availability",
    getRestaurantAvailability
);

export default restaurantRouter;