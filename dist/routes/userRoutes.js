import { Router } from "express";
import { protect, adminOnly, } from "../middlewares/authMiddleware.js";
const userRouter = Router();
// ==========================================
// Get User Profile
// GET /api/users/profile
// Protected
// ==========================================
userRouter.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Profile accessed successfully",
        user: req.user,
    });
});
// ==========================================
// Admin Only Route
// GET /api/users/admin
// Protected + Admin
// ==========================================
userRouter.get("/admin", protect, adminOnly, (req, res) => {
    res.status(200).json({
        message: "Welcome Admin!",
        user: req.user,
    });
});
export default userRouter;
