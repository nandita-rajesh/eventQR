import mongoose from "mongoose";
import Event from "../models/events.model.js";
import Participant from "../models/participant.model.js";
import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

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

    if (event.organizer.toString() !== user.id) {
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

  if (event.organizer.toString() !== user.id) {
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