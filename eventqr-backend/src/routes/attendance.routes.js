import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

import { getEventReport, getSessionParticipants, markManualAttendance, scanAttendance } from "../controllers/attendance.controller.js";

const router = express.Router();

router.post(
  "/scan",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  scanAttendance
);

router.post(
  "/manual",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  markManualAttendance
);

router.get(
  "/events/:id/report",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  getEventReport
);

router.get(
  "/sessions/:sessionId/participants",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  getSessionParticipants
);

export default router;