import { createEventService, getMyEventsService } from "../services/events.service.js";

export const createEvent = async (req, res) => {
  try {
    const event = await createEventService(req.body, req.user.userId);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await getMyEventsService(req.user.userId);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};