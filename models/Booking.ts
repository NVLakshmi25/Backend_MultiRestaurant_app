import {
    Document,
    model,
    Schema,
    Types,
} from "mongoose";

import crypto from "crypto";

// ==========================================
// Booking Interface
// ==========================================

export interface IBooking extends Document {
    user: Types.ObjectId;
    restaurant: Types.ObjectId;
    date: Date;
    time: string;
    guests: number;
    occasion?: string;
    specialRequests?: string;
    status: "confirmed" | "cancelled" | "completed";
    bookingId: string;
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// Booking Schema
// ==========================================

const BookingSchema = new Schema<IBooking>(
    {
        // User who made the booking
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Restaurant being booked
        restaurant: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },

        // Booking date
        date: {
            type: Date,
            required: true,
        },

        // Booking time
        time: {
            type: String,
            required: true,
            trim: true,
        },

        // Number of guests
        guests: {
            type: Number,
            required: true,
            min: 1,
        },

        // Occasion
        occasion: {
            type: String,
            trim: true,
        },

        // Special requests
        specialRequests: {
            type: String,
            trim: true,
        },

        // Booking status
        status: {
            type: String,
            enum: [
                "confirmed",
                "cancelled",
                "completed",
            ],
            default: "confirmed",
        },

        // Unique booking reference
        bookingId: {
            type: String,
            unique: true,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// ==========================================
// Generate Booking ID automatically
// ==========================================

BookingSchema.pre("validate", function (next) {
    if (!this.bookingId) {
        this.bookingId = `GR-${crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()}`;
    }

    next();
});

// ==========================================
// Booking Model
// ==========================================

export const Booking = model<IBooking>(
    "Booking",
    BookingSchema
);