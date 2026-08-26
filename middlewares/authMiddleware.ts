import {
    NextFunction,
    Request,
    Response,
} from "express";

import jwt from "jsonwebtoken";

import { IUser, User } from "../models/User.js";

export interface AuthRequest extends Request {
    user?: IUser;
}

/**
 * Protects private routes by validating the JWT
 * and attaching the authenticated user to the request.
 */
export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            res.status(401).json({
                message: "Not authorized, no token",
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({
                message: "Not authorized, no token",
            });
            return;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            res.status(500).json({
                message: "JWT_SECRET is not configured",
            });
            return;
        }

        const decoded = jwt.verify(
            token,
            secret
        ) as { id: string };

        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            res.status(401).json({
                message:
                    "Not authorized, user not found",
            });
            return;
        }

        req.user = user;

        next();
    } catch (error) {
        console.error(
            "Auth Middleware Error:",
            error
        );

        res.status(401).json({
            message:
                "Not authorized, token failed",
        });
    }
};

/**
 * Allows access only to admin users.
 */
export const adminOnly = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (req.user?.role === "admin") {
        next();
        return;
    }

    res.status(403).json({
        message:
            "Access denied, admin role required",
    });
};

/**
 * Allows access to owners and administrators.
 */
export const ownerOnly = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (
        req.user?.role === "owner" ||
        req.user?.role === "admin"
    ) {
        next();
        return;
    }

    res.status(403).json({
        message:
            "Access denied, owner or admin role required",
    });
};