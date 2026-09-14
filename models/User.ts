import {
  Document,
  model,
  Schema,
} from "mongoose";

export type UserRole =
  | "user"
  | "admin"
  | "owner";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Remove password from JSON responses
// ==========================================

UserSchema.set(
  "toJSON",
  {
    transform: (_doc, ret) => {
      delete ret.password;
      return ret;
    },
  }
);

export const User =
  model<IUser>("User", UserSchema);