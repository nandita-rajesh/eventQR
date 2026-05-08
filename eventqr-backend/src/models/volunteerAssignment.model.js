import mongoose from "mongoose";

const volunteerAssignmentSchema =
  new mongoose.Schema(
    {
      volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      },
    },
    { timestamps: true }
  );

// prevent duplicate assignments
volunteerAssignmentSchema.index(
  { volunteer: 1, event: 1 },
  { unique: true }
);

export default mongoose.model(
  "VolunteerAssignment",
  volunteerAssignmentSchema
);