import { addParticipantService, addSessionService, assignVolunteerService, createEventService, deleteEventService, getAssignedVolunteersService, getEventAttendanceSummaryService, getEventByIdService, getMyEventsService, getParticipantsService, resendParticipantQrService, searchParticipantsService, updateEventService, uploadParticipantsCSVService } from "../services/events.service.js";
import fs from "fs";

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

export const addParticipant = async (req, res) => {
    try {
        const participant = await addParticipantService(
            req.params.id,
            req.user,
            req.body
        );

        return res.status(201).json(participant);

    } catch(err){
        if (err.message === "Invalid event ID"){
            return res.status(400).json({ error: err.message });
        }

        if (err.message === "Event not found") {
            return res.status(404).json({ error: err.message });
        }

        if (err.message === "Unauthorized") {
            return res.status(403).json({ error: err.message });
        }

        if (err.message === "Duplicate participant"){
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({ error: err.message });
    }
}

export const getParticipants = async (req, res) => {
  try {

    const participants = await getParticipantsService(
      req.params.id,
      req.user
    );

    return res.status(200).json(participants);

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

    return res.status(500).json({ error: err.message });
  }
};

export const uploadParticipantsCSV = async (req, res) => {
  try {
    // basic server-side checks in addition to multer
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "text/plain",
    ];

    if (!allowed.includes(req.file.mimetype)) {
      // remove uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
      return res.status(400).json({ error: "Only CSV files are allowed" });
    }

    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (req.file.size && req.file.size > MAX_BYTES) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
      return res.status(400).json({ error: "CSV file exceeds size limit (5 MB)" });
    }

    const participants = await uploadParticipantsCSVService(
      req.params.id,
      req.user,
      req.file.path
    );

    return res.status(201).json({
      message: "Participants uploaded successfully",
      count: participants.length,
      participants,
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const searchParticipants = async (req, res) => {

  try {
    const participants = await searchParticipantsService(
      req.params.id,
      req.query.q,
      req.user
    );

    return res.status(200).json(participants);

  } catch (err) {

    if (err.message === "Invalid event ID") {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (err.message === "Event not found") {
      return res.status(404).json({
        error: err.message,
      });
    }

    if (err.message === "Search query required") {
      return res.status(400).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getEventAttendanceSummary = async (req, res) => {
  try {
    const summary =
      await getEventAttendanceSummaryService(
        req.params.id,
        req.user
      );

    return res.status(200).json(summary);

  } catch (err) {

    if (err.message === "Invalid event ID") {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (err.message === "Event not found") {
      return res.status(404).json({
        error: err.message,
      });
    }

    if (err.message === "Unauthorized") {
      return res.status(403).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const resendParticipantQr = async (req, res) => {
  try {
    await resendParticipantQrService(
      req.params.eventId,
      req.params.participantId,
      req.user
    );

    return res.status(200).json({
      message: "QR code resent successfully",
    });

  } catch (err) {search

    if (err.message === "Invalid event ID" || err.message === "Invalid participant ID") {
      return res.status(400).json({error: err.message});
    }

    if (err.message === "Event not found" || err.message === "Participant not found") {
      return res.status(404).json({error: err.message});
    }

    if (err.message === "Unauthorized") {
      return res.status(403).json({error: err.message});
    }

    return res.status(500).json({error: err.message});
  }
};

export const assignVolunteer = async (
  req,
  res
) => {

  try {

    const assignment =
      await assignVolunteerService(
        req.params.eventId,
        req.body.volunteerId,
        req.user
      );

    return res.status(201).json({
      message: "Volunteer assigned successfully",
      assignment,
    });

  } catch (err) {

    if (
      err.message === "Invalid event ID" ||
      err.message === "Invalid volunteer ID"
    ) {
      return res.status(400).json({error: err.message});
    }

    if (
      err.message === "Event not found" ||
      err.message === "Volunteer not found"
    ) {
      return res.status(404).json({error: err.message});
    }

    if (
      err.message === "User is not a volunteer"
    ) {
      return res.status(400).json({error: err.message});
    }

    if (
      err.message === "Volunteer already assigned"
    ) {
      return res.status(409).json({error: err.message});
    }

    if (
      err.message === "Unauthorized"
    ) {
      return res.status(403).json({error: err.message});
    }

    return res.status(500).json({error: err.message});
  }
};

export const getAssignedVolunteers = async (
  req,
  res
) => {

  try {

    const volunteers =
      await getAssignedVolunteersService(
        req.params.eventId,
        req.user
      );

    return res.status(200).json({
      volunteers,
    });

  } catch (err) {

    if (
      err.message === "Invalid event ID"
    ) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (
      err.message === "Event not found"
    ) {
      return res.status(404).json({
        error: err.message,
      });
    }

    if (
      err.message === "Unauthorized"
    ) {
      return res.status(403).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};