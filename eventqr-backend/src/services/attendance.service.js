import mongoose from "mongoose";

import Participant from "../models/participant.model.js";
import Event from "../models/events.model.js";
import Attendance from "../models/attendance.model.js";
import checkEventAccess from "../utils/checkEventAccess.js";

export const scanAttendanceService = async (user, data) => {

  const { token, sessionId } = data;

  if (!token || !sessionId) {
    throw new Error("Token and sessionId are required");
  }

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new Error("Invalid session ID");
  }

  const participant = await Participant.findOne({
    qrToken: token,
  });

  if (!participant) {
    throw new Error("Participant not found");
  }

  const event = await Event.findById(participant.event);

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

  const session = event.sessions.id(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const existingAttendance = await Attendance.findOne({
    participant: participant._id,
    session: sessionId,
  });

  if (existingAttendance) {
    throw new Error("Attendance already marked");
  }

  const attendance = await Attendance.create({
    participant: participant._id,
    event: event._id,
    session: sessionId,
    scannedBy: user.id,
  });

  return attendance;
};

export const markManualAttendanceService = async (
  user,
  data
) => {

  const { participantId, sessionId } = data;

  if (!participantId || !sessionId) {
    throw new Error(
      "participantId and sessionId are required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    throw new Error("Invalid participant ID");
  }

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new Error("Invalid session ID");
  }

  const participant = await Participant.findById(
    participantId
  );

  if (!participant) {
    throw new Error("Participant not found");
  }

  const event = await Event.findById(participant.event);

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

  const session = event.sessions.id(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const existingAttendance = await Attendance.findOne({
    participant: participantId,
    session: sessionId,
  });

  if (existingAttendance) {
    throw new Error("Attendance already marked");
  }

  const attendance = await Attendance.create({
    participant: participantId,
    event: event._id,
    session: sessionId,
    scannedBy: user.id,
  });

  return attendance;
};

export const getEventReportService = async (eventId, user) => {
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

  const totalParticipants = await Participant.countDocuments({ event: eventId });

  const totalAttendanceRecords = await Attendance.countDocuments({ event: eventId });

  const sessions = [];

  for (const session of event.sessions) {
    const attendanceCount = await Attendance.countDocuments({ session: session._id });

    sessions.push({
      sessionId: session._id,
      sessionName: session.name,
      attendanceCount,
    });
  }

  return {
    eventTitle: event.title,
    totalParticipants,
    totalAttendanceRecords,
    sessions,
  };
};

export const getSessionParticipantsService = async (sessionId,user) => {

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new Error("Invalid session ID");
  }

  const attendanceRecords = await Attendance.find({
    session: sessionId,
  }).populate("participant", "name email")
    .populate("event", "title organizer")
    .sort({ scannedAt: 1 });

  if (attendanceRecords.length === 0) {
    throw new Error("Session not found");
  }

  const event = attendanceRecords[0].event;

  const hasAccess =
    await checkEventAccess(
      event,
      user
    );

  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const participants = attendanceRecords.map((record) => ({
    participantId: record.participant._id,
    name: record.participant.name,
    email: record.participant.email,
    scannedAt: record.scannedAt,
  }));

  return participants;
};

export const exportAttendanceCSVService = async (
  eventId,
  user
) => {

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
  });

  // CSV headers
  const headers = [
    "Name",
    "Email",
    ...event.sessions.map((s) => s.name),
  ];

  const rows = [];

  rows.push(headers.join(","));

  // build rows
  for (const participant of participants) {

    const row = [
      participant.name,
      participant.email,
    ];

    for (const session of event.sessions) {

      const attendance =
        await Attendance.findOne({
          participant: participant._id,
          session: session._id,
        });

      row.push(
        attendance ? "Present" : "Absent"
      );
    }

    rows.push(row.join(","));
  }

  return rows.join("\n");
};