import { exportAttendanceCSVService, getEventReportService, getSessionParticipantsService, markManualAttendanceService, scanAttendanceService } from "../services/attendance.service.js";

export const scanAttendance = async (req, res) => {

  try {

    const attendance = await scanAttendanceService(
      req.user,
      req.body
    );

    return res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });

  } catch (err) {

    if (
      err.message === "Invalid session ID" ||
      err.message === "Token and sessionId are required"
    ) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (
      err.message === "Participant not found" ||
      err.message === "Session not found"
    ) {
      return res.status(404).json({
        error: err.message,
      });
    }

    if (err.message === "Attendance already marked") {
      return res.status(409).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const markManualAttendance = async (req, res) => {

  try {

    const attendance = await markManualAttendanceService(
      req.user,
      req.body
    );

    return res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });

  } catch (err) {

    if (
      err.message === "participantId and sessionId are required" ||
      err.message === "Invalid participant ID" ||
      err.message === "Invalid session ID"
    ) {
      return res.status(400).json({error: err.message});
    }

    if (
      err.message === "Participant not found" ||
      err.message === "Session not found"
    ) {
      return res.status(404).json({ error: err.message});
    }

    if (err.message === "Attendance already marked") {
      return res.status(409).json({error: err.message});
    }

    return res.status(500).json({error: err.message});
  }
};

export const getEventReport = async (req, res) => {
  try {
    const report =
      await getEventReportService(
        req.params.id,
        req.user
      );

    return res.status(200).json(report);

  } catch (err) {
    if (err.message === "Invalid event ID") {
      return res.status(400).json({error: err.message,});
    }

    if (err.message === "Event not found") {
      return res.status(404).json({error: err.message});
    }

    if (err.message === "Unauthorized") {
      return res.status(403).json({error: err.message});
    }

    return res.status(500).json({error: err.message});
  }
};

export const getSessionParticipants = async (req, res) => {
  try {

    const participants =
      await getSessionParticipantsService(
        req.params.sessionId,
        req.user
      );

    return res.status(200).json(participants);

  } catch (err) {

    if (err.message === "Invalid session ID") {
      return res.status(400).json({error: err.message});
    }

    if (err.message === "Session not found") {
      return res.status(404).json({error: err.message});
    }

    if (err.message === "Unauthorized") {
      return res.status(403).json({error: err.message});
    }

    return res.status(500).json({error: err.message});
  }
};

export const exportAttendanceCSV = async (
  req,
  res
) => {

  try {

    const csv =
      await exportAttendanceCSVService(
        req.params.id,
        req.user
      );

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance-report.csv"
    );

    return res.status(200).send(csv);

  } catch (err) {

    if (err.message === "Invalid event ID") {
      return res.status(400).json({error: err.message});
    }

    if (err.message === "Event not found") {
      return res.status(404).json({error: err.message});
    }

    if (err.message === "Unauthorized") {
      return res.status(403).json({error: err.message});
    }

    return res.status(500).json({error: err.message});
  }
};