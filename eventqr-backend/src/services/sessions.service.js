import mongoose from "mongoose";
import Event from "../models/events.model.js";

export const updateSessionService = async (sessionId, user, data) => {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new Error("Invalid session ID");
    }

    const event = await Event.findOne({
        "sessions._id": sessionId,
    });

    if (!event) {
        throw new Error("Session not found");
    }

    if (event.organizer.toString() !== user.id) {
        throw new Error("Unauthorized");
    }

    const session = event.sessions.id(sessionId);

    const allowedFields = ["name", "description", "startTime", "endTime"];

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            session[field] = data[field];
        }
    });

    if (session.startTime && session.endTime) {
        if (new Date(session.startTime) >= new Date(session.endTime)) {
            throw new Error("Invalid session time");
        }
    }

    await event.save();

    return session;
};