import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { participant: 1, session: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);
