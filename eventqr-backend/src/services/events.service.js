import mongoose from "mongoose";
import Event from "../models/events.model.js";

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