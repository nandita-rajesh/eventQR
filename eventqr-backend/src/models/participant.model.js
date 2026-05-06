import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: false
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    qrToken: {
      type: String,
      unique: true,
      required: true,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

participantSchema.index(
  { email: 1, event: 1 },
  { unique: true }
);

export default mongoose.model("Participant", participantSchema);
