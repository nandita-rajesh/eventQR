import mongoose from "mongoose";
import User from "../models/user.model.js";
import Event from "../models/events.model.js";
import Participant from "../models/participant.model.js";
import Attendance from "../models/attendance.model.js";
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
  const assignments = await volunteerAssignment
    .find({
      volunteer: user.id,
    })
    .populate("event");

  return assignments
    .map((assignment) => assignment.event)
    .filter(Boolean);
};

export const getVolunteerEventDetailsService = async (
  eventId,
  user
) => {

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  const assignment = await volunteerAssignment.findOne({
    volunteer: user.id,
    event: eventId,
  });

  if (!assignment) {
    throw new Error("Unauthorized");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  // total registered participants
  const totalParticipants =
    await Participant.countDocuments({
      event: eventId,
    });

  // unique checked-in participants
  const checkedInParticipants =
    await Attendance.distinct(
      "participant",
      {
        event: eventId,
      }
    );

  const checkedIn =
    checkedInParticipants.length;

  const pending =
    totalParticipants - checkedIn;

  return {
    _id: event._id,
    title: event.title,
    description: event.description,
    venue: event.venue,
    date: event.date,
    sessions: event.sessions,
    status: event.status,
    stats: {
      totalParticipants,
      checkedIn,
      pending,
    },
  };
};