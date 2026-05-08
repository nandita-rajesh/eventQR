import User from "../models/user.model.js";
import volunteerAssignment from "../models/volunteerAssignment.model.js";

export const searchVolunteersService =
  async (query) => {

    if (!query) {
      throw new Error("Search query required");
    }

    const volunteers = await User.find({
      role: "volunteer",

      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },

        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    })
    .select("name email")
    .limit(10);

    return volunteers;
  };

export const getAssignedEventsService = async (user) => {
  const assignments = await volunteerAssignment.find({
    volunteer: user.userId,
  }).populate("event");

  // return only events
  return assignments.map((assignment) => assignment.event);
};