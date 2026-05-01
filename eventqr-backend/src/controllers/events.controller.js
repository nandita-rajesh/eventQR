import { addSessionService, createEventService, deleteEventService, getEventByIdService, getMyEventsService, updateEventService } from "../services/events.service.js";

export const createEvent = async (req, res) => {
    try {
        const event = await createEventService(req.body, req.user.id);
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const events = await getMyEventsService(req.user.id);
        return res.json(events);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getEventById = async (req, res) => {
  try {
    const event = await getEventByIdService(
        req.params.id,
        req.user
    );

    return res.json(event);

  } catch (err) {
    if (err.message === "Event not found") {
        return res.status(404).json({ error: err.message });
    }

    if (err.message === "Unauthorized") {
        res.status(403).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await updateEventService(
            req.params.id, req.user, req.body);
        
        return res.json(updatedEvent);
        
    } catch(err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ error: err.message });
        }

        if (err.message === "Unauthorized") {
            return res.status(403).json({ error: err.message });
        }

        return res.status(400).json({error: err.message})
    }
}

export const deleteEvent = async (req, res) => {
    try {
        await deleteEventService(req.params.id, req.user);

        return res.json({message: "Event deleted successfully"});
    } catch(err) {
        if (err.message === "Event not found") {
            return res.status(404).json({ error: err.message });
        }

        if (err.message === "Unauthorized") {
            return res.status(403).json({ error: err.message });
        }

        return res.status(400).json({error: err.message});
    }
}

export const addSession = async (req, res) => {
    try {
        const session = await addSessionService(req.params.id, req.user, req.body);

        res.status(201).json(session)
    } catch(err){
        if(err.message === "Invalid event ID"){
            return res.status(400).json({error: err.message});
        }
        
        if(err.message === "Invalid session time"){
            return res.status(400).json({error: err.message});
        }

        if (err.message === "Event not found") {
            return res.status(404).json({ error: err.message });
        }

        if (err.message === "Unauthorized") {
            return res.status(403).json({ error: err.message });
        }

        return res.status(400).json({error: err.message});
    }
}