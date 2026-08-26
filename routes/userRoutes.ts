import { Router } from "express";

import {
    protect,
    adminOnly,
} from "../middlewares/authmiddleware.js";

const userRouter = Router();


// Any logged-in user
userRouter.get(
    "/profile",
    protect,
    (req, res) => {

        res.json({
            message: "Profile accessed successfully",
            user: req.user,
        });

    }
);


// Admin only
userRouter.get(
    "/admin",
    protect,
    adminOnly,
    (req, res) => {

        res.json({
            message: "Welcome Admin!",
            user: req.user,
        });

    }
);

export default userRouter;