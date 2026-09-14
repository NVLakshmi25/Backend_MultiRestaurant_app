import { model, Schema, } from "mongoose";
const UserSchema = new Schema({
    // ==========================================
    // Name
    // ==========================================
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // ==========================================
    // Email
    // ==========================================
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    // ==========================================
    // Password
    // ==========================================
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    // ==========================================
    // Phone
    // ==========================================
    phone: {
        type: String,
        trim: true,
        minlength: 6,
    },
    // ==========================================
    // Role
    // ==========================================
    role: {
        type: String,
        enum: [
            "user",
            "admin",
            "owner",
        ],
        default: "user",
    },
}, {
    timestamps: true,
});
// ==========================================
// Remove password from JSON responses
// ==========================================
UserSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.password;
        return ret;
    },
});
export const User = model("User", UserSchema);
