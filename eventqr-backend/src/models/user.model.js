import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "organizer", "volunteer"],
      default: "volunteer",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);