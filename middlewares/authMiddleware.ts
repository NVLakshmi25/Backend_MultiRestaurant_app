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

// ==========================================
// Protect Middleware
// ==========================================

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader =
      req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      res.status(401).json({
        message:
          "Not authorized, no token provided",
      });

      return;
    }

    // Extract token
    const token = authHeader
      .substring(7)
      .trim();

    if (!token) {
      res.status(401).json({
        message:
          "Not authorized, no token provided",
      });

      return;
    }

    // JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET is missing from .env"
      );

      res.status(500).json({
        message:
          "JWT_SECRET is not configured",
      });

      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      secret
    ) as {
      id: string;
    };

    if (!decoded?.id) {
      res.status(401).json({
        message:
          "Invalid authentication token",
      });

      return;
    }

    // Find user
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

    // Attach user to request
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

// ==========================================
// Admin Only
// ==========================================

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

// ==========================================
// Owner / Admin Only
// ==========================================

export const ownerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const role = req.user?.role;

  if (
    role === "owner" ||
    role === "admin"
  ) {
    next();
    return;
  }

  res.status(403).json({
    message:
      "Access denied, owner or admin role required",
  });
};