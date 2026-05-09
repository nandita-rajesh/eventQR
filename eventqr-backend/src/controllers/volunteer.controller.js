import { getAssignedEventsService, getVolunteerEventDetailsService, searchVolunteersService } from "../services/volunteer.service.js";

export const searchVolunteers = async (
  req,
  res
) => {

  try {

    const volunteers =
      await searchVolunteersService(
        req.query.q
      );

    return res.status(200).json(volunteers);

  } catch (err) {

    if (
      err.message === "Search query required"
    ) {
      return res.status(400).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getAssignedEvents = async (req, res) => {
  try {
    const events = await getAssignedEventsService(req.user);

    return res.json(events);

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getVolunteerEventDetails = async (req, res) => {
  try {
    const event = await getVolunteerEventDetailsService(
      req.params.eventId,
      req.user
    );

    return res.json(event);

  } catch (err) {
    if (err.message === "Invalid event ID") {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === "Event not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "Unauthorized") {
      return res.status(403).json({ error: err.message });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};