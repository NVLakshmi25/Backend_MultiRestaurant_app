import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { User } from "../models/User.js";
import { AuthRequest } from "../middlewares/auth.js";

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


        // Validate required fields
        if (!name || !email || !password) {
            res.status(400).json({
                message:
                    "Please enter all required fields",
            });
            return;
        }


        // Check if user already exists
        const userExists = await User.findOne({
            email: email.toLowerCase(),
        });


        if (userExists) {
            res.status(400).json({
                message: "User already exists",
            });
            return;
        }


        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );


        // Create user
        // Role defaults to "user"
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role: "user",
        });


        // Send response
        if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(
                user._id.toString()
            ),
        });
    }
    else{
        res.status(400).json({message :"Invalid user data "}) ;

    }

    } catch (error: any) {

        console.error(
            "Register Error:",
            error
        );

        res.status(500).json({
            message:
                error.message ||
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


        // Validate fields
        if (!email || !password) {
            res.status(400).json({
                message:
                    "Please provide email and password",
            });
            return;
        }


        // Find (check) user
        const user = await User.findOne({
            email: email.toLowerCase(),
        });


        if (!user) {
            res.status(401).json({
                message:
                    "Invalid email or password",
            });
            return;
        }


        // Compare password
        const isMatch =
            await bcrypt.compare(
                password,
                user.password || ""
            );


        if (!isMatch) {
            res.status(401).json({
                message:
                    "Invalid email or password",
            });
            return;
        }


        // Login successful
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(
                user._id.toString()
            ),
        });

    } catch (error: any) {

        console.error(
            "Login Error:",
            error
        );

        res.status(500).json({
            message:
                error.message ||
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

        // Check authenticated user
        if (!req.user) {
            res.status(401).json({
                message: "Not authorized",
            });
            return;
        }


        // Return current user
        res.status(200).json(
            req.user
        );

    } catch (error: any) {

        console.error(
            "Get Me Error:",
            error
        );

        res.status(500).json({
            message:
                error.message ||
                "Server error",
        });
    }
};