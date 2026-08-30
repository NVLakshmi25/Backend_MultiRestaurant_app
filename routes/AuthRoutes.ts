import { Router } from "express";

import {
    registerUser,
    loginUser,
    getMe,
} from "../controllers/auth.js";

import { protect } from "../middlewares/authMiddleware.js";

const authRouter = Router();


// Register
authRouter.post(
    "/register",
    registerUser
);


// Login
authRouter.post(
    "/login",
    loginUser
);


// Get current logged-in user
authRouter.get(
    "/me",
    protect,
    getMe
);


export default authRouter;