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