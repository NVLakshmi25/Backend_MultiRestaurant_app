
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { User } from "../models/User.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";


// ==========================================
// Generate JWT Token
// ==========================================

const generateToken = (id: string): string => {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            "JWT_SECRET is not defined in .env file"
        );
    }

    return jwt.sign(
        { id },
        secret,
        {
            expiresIn: "30d",
        }
    );
};


// ==========================================
// Register a new user
// POST /api/auth/register
// ==========================================

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const {
            name,
            email,
            password,
            phone,
        } = req.body;


        // ==========================================
        // Validate required fields
        // ==========================================

        if (
            !name ||
            !email ||
            !password
        ) {

            res.status(400).json({
                message:
                    "Please enter all required fields",
            });

            return;
        }


        // ==========================================
        // Clean input values
        // ==========================================

        const trimmedName =
            String(name).trim();

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const trimmedPhone =
            phone
                ? String(phone).trim()
                : undefined;


        // ==========================================
        // Validate password
        // ==========================================

        if (password.length < 6) {

            res.status(400).json({
                message:
                    "Password must be at least 6 characters",
            });

            return;
        }


        // ==========================================
        // Check if user already exists
        // ==========================================

        const userExists =
            await User.findOne({
                email: normalizedEmail,
            });


        if (userExists) {

            res.status(400).json({
                message:
                    "User already exists",
            });

            return;
        }


        // ==========================================
        // Hash password
        // ==========================================

        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );


        // ==========================================
        // Create user
        //
        // New registrations are always normal users.
        // Owner/Admin roles must be assigned separately.
        // ==========================================

        const user =
            await User.create({
                name: trimmedName,
                email: normalizedEmail,
                password: hashedPassword,
                phone: trimmedPhone,
                role: "user",
            });


        // ==========================================
        // Generate token
        // ==========================================

        const token =
            generateToken(
                user._id.toString()
            );


        // ==========================================
        // Send response
        // ==========================================

        res.status(201).json({

            token,

            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },

        });

    } catch (error: unknown) {

        console.error(
            "Register Error:",
            error
        );


        if (
            error instanceof Error
        ) {

            res.status(500).json({
                message:
                    error.message ||
                    "Server error",
            });

            return;
        }


        res.status(500).json({
            message:
                "Server error",
        });
    }
};


// ==========================================
// Login user
// POST /api/auth/login
// ==========================================

export const loginUser = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        const {
            email,
            password,
        } = req.body;


        // ==========================================
        // Validate fields
        // ==========================================

        if (
            !email ||
            !password
        ) {

            res.status(400).json({
                message:
                    "Please provide email and password",
            });

            return;
        }


        // ==========================================
        // Normalize email
        // ==========================================

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        // ==========================================
        // Find user
        // ==========================================

        const user =
            await User.findOne({
                email: normalizedEmail,
            });


        if (!user) {

            res.status(401).json({
                message:
                    "Invalid email or password",
            });

            return;
        }


        // ==========================================
        // Check password
        // ==========================================

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password || ""
            );


        if (!isPasswordValid) {

            res.status(401).json({
                message:
                    "Invalid email or password",
            });

            return;
        }


        // ==========================================
        // IMPORTANT:
        //
        // Get the CURRENT role from MongoDB.
        //
        // This is important because the role may have
        // been changed manually in MongoDB Atlas.
        // ==========================================

        const currentUser =
            await User.findById(
                user._id
            ).select("-password");


        if (!currentUser) {

            res.status(401).json({
                message:
                    "User not found",
            });

            return;
        }


        // ==========================================
        // Generate JWT
        // ==========================================

        const token =
            generateToken(
                currentUser._id.toString()
            );


        // ==========================================
        // Debug logs
        // ==========================================

        console.log(
            "LOGIN USER ID:",
            currentUser._id.toString()
        );

        console.log(
            "LOGIN USER EMAIL:",
            currentUser.email
        );

        console.log(
            "LOGIN USER ROLE:",
            currentUser.role
        );


        // ==========================================
        // Send login response
        // ==========================================

        res.status(200).json({

            token,

            user: {
                _id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                role: currentUser.role,
            },

        });

    } catch (error: unknown) {

        console.error(
            "Login Error:",
            error
        );


        if (
            error instanceof Error
        ) {

            res.status(500).json({
                message:
                    error.message ||
                    "Server error",
            });

            return;
        }


        res.status(500).json({
            message:
                "Server error",
        });
    }
};


// ==========================================
// Get current logged-in user
// GET /api/auth/me
// ==========================================

export const getMe = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {

    try {

        // ==========================================
        // Check authenticated user
        // ==========================================

        if (!req.user) {

            res.status(401).json({
                message:
                    "Not authorized",
            });

            return;
        }


        // ==========================================
        // Send current user
        //
        // protect middleware already gets the
        // latest user from MongoDB.
        // ==========================================

        res.status(200).json({

            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,

        });

    } catch (error: unknown) {

        console.error(
            "Get Me Error:",
            error
        );


        if (
            error instanceof Error
        ) {

            res.status(500).json({
                message:
                    error.message ||
                    "Server error",
            });

            return;
        }


        res.status(500).json({
            message:
                "Server error",
        });
    }
};

