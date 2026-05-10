import mongoose from "mongoose";
import Event from "../models/events.model.js";
import Participant from "../models/participant.model.js";
import fs from "fs";
import csv from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import sendParticipantQr from "../utils/sendParticipantQR.js";
import checkEventAccess from "../utils/checkEventAccess.js";
import User from "../models/user.model.js";
import volunteerAssignment from "../models/volunteerAssignment.model.js";

export const createEventService = async (data, userId) => {
    const { title, description, date, venue } = data;

    if (!title || !date || !venue) {
        throw new Error("Required fields missing");
    }

    return await Event.create({
        title,
        description,
        date,
        venue,
        organizer: userId,
    });
};

export const getMyEventsService = async (userId) => {
    return await Event.find({ organizer: userId });
};

export const getEventByIdService = async (eventId, user) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid event ID");
    }

    const event = await Event.findById(eventId);

    if (!event) {
    throw new Error("Event not found");
    }

    if (event.organizer.toString() !== user.id) {
    throw new Error("Unauthorized");
    }

    return event;
};

export const updateEventService = async (eventId, user, data) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid event ID");
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }

    if (event.organizer.toString() !== user.id) {
        throw new Error("Unauthorized");
    }

    const allowedFields = ["title", "description", "date", "venue", "isPublic"];

    allowedFields.forEach((field) => {
        if(data[field] !== undefined){
            event[field] = data[field];
        }
    })

    await event.save()

    return event;
}

export const deleteEventService = async (eventId, user) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid event ID");
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }

    if (event.organizer.toString() !== user.id) {
        throw new Error("Unauthorized");
    }

    await event.deleteOne();

    return true;
}

export const addSessionService = async (eventId, user, data) => {
    const { name, description, startTime, endTime } = data;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid event ID");
    }

    if (!name || !description || !startTime || !endTime) {
        throw new Error("All fields required");
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw new Error("Invalid session time");
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }

    if (event.organizer.toString() !== user.id) {
        throw new Error("Unauthorized");
    }

    const newSession = {
        name,
        description, 
        startTime,
        endTime,
    };

    event.sessions.push(newSession);

    await event.save();

    return event.sessions[event.sessions.length - 1];
}

export const addParticipantService = async (eventId, user, data)=>{
    const {name, email, phoneNumber} = data;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid event ID");
    }

    if (!name || !email ){
        throw new Error("All fields are required");
    }

    const event = await Event.findById(eventId);

    if(!event){
        throw new Error("Event not found");
    }

    const hasAccess =
      await checkEventAccess(
        event,
        user
      );
  
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Participant.findOne({
        email: normalizedEmail,
        event: eventId,
    });

    if (existing) {
        throw new Error("Duplicate participant");
    }

    const participant = await Participant.create({
        name: name.trim(),
        email: normalizedEmail,
        phoneNumber: phoneNumber?.trim() || undefined,
        event: eventId,
        qrToken: uuidv4(),
    });

    await sendParticipantQr(participant, event);

    return participant;
}

export const getParticipantsService = async (eventId, user) => {

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const hasAccess =
    await checkEventAccess(
      event,
      user
    );

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const participants = await Participant.find({
    event: eventId,
  }).sort({ createdAt: -1 });

  return participants;
};

export const uploadParticipantsCSVService = async (
  eventId,
  user,
  filePath
) => {

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizer.toString() !== user.id) {
    throw new Error("Unauthorized");
  }

  const participants = [];

  return new Promise((resolve, reject) => {

    fs.createReadStream(filePath)
      .pipe(csv())

      .on("data", (row) => {

        // expected columns:
        // name,email,phoneNumber

        if (row.name && row.email) {

          participants.push({
            name: row.name.trim(),
            email: row.email.toLowerCase().trim(),
            phoneNumber: row.phoneNumber?.trim(),
            event: eventId,
            qrToken: uuidv4(),
          });
        }
      })

      .on("end", async () => {

        try {

          const inserted = [];

          for (const participant of participants) {

            const exists = await Participant.findOne({
              email: participant.email,
              event: eventId,
            });

            if (!exists) {
                const created = await Participant.create(participant);
                await sendParticipantQr(created, event);
                inserted.push(created);
            }
          }

          fs.unlinkSync(filePath);

          resolve(inserted);

        } catch (err) {

          reject(err);
        }
      })

      .on("error", reject);
  });
};

export const searchParticipantsService = async (
  eventId,
  query,
  user
) => {

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  if (!query) {
    throw new Error("Search query required");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const hasAccess =
    await checkEventAccess(
      event,
      user
    );

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const participants = await Participant.find({
    event: eventId,

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
    .limit(10)
    .sort({ name: 1 });

  return participants;
};

export const getEventAttendanceSummaryService = async (eventId, user) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const hasAccess =
    await checkEventAccess(
      event,
      user
    );

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const totalParticipants =
    await Participant.countDocuments({
      event: eventId,
    });

  const totalAttendanceRecords =
    await Attendance.countDocuments({
      event: eventId,
    });

  return {
    eventTitle: event.title,
    totalParticipants,
    totalAttendanceRecords,
  };
};

export const resendParticipantQrService = async (eventId, participantId, user) => {

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    throw new Error("Invalid participant ID");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const hasAccess =
    await checkEventAccess(
      event,
      user
    );

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const participant = await Participant.findOne({
    _id: participantId,
    event: eventId,
  });

  if (!participant) {
    throw new Error("Participant not found");
  }

  await sendParticipantQr(participant, event);

  return true;
};

export const assignVolunteerService = async (
  eventId,
  volunteerId,
  user
) => {

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid event ID");
  }

  if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
    throw new Error("Invalid volunteer ID");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const hasAccess =
    await checkEventAccess(
      event,
      user
    );

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const volunteer = await User.findById(
    volunteerId
  );

  if (!volunteer) {
    throw new Error("Volunteer not found");
  }

  if (volunteer.role !== "volunteer") {
    throw new Error("User is not a volunteer");
  }

  const existingAssignment =
    await volunteerAssignment.findOne({
      volunteer: volunteerId,
      event: eventId,
    });

  if (existingAssignment) {
    throw new Error("Volunteer already assigned");
  }

  const assignment =
    await volunteerAssignment.create({
      volunteer: volunteerId,
      event: eventId,
    });

  return assignment;
};