import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

import { exportAttendanceCSV, getEventReport, getSessionParticipants, markManualAttendance, scanAttendance } from "../controllers/attendance.controller.js";

const router = express.Router();

/**
 * @swagger
 * /attendance/scan:
 *   post:
 *     summary: Scan QR code and mark attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - sessionId
 *             properties:
 *               token:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               sessionId:
 *                 type: string
 *                 example: 68123abc456def789
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Participant/Event/Session not found
 *       409:
 *         description: Attendance already marked
 */
router.post(
  "/scan",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  scanAttendance
);

/**
 * @swagger
 * /attendance/manual:
 *   post:
 *     summary: Manually mark attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *               - sessionId
 *             properties:
 *               participantId:
 *                 type: string
 *                 example: 68123abc456def789
 *               sessionId:
 *                 type: string
 *                 example: 68123fff456aaa111
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Participant/Event/Session not found
 *       409:
 *         description: Attendance already marked
 */
router.post(
  "/manual",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  markManualAttendance
);

/**
 * @swagger
 * /attendance/events/{id}/report:
 *   get:
 *     summary: Get attendance report for an event
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 68123abc456def789
 *     responses:
 *       200:
 *         description: Event attendance report fetched successfully
 *       400:
 *         description: Invalid event ID
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get(
  "/events/:id/report",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  getEventReport
);

/**
 * @swagger
 * /attendance/sessions/{sessionId}/participants:
 *   get:
 *     summary: Get participants who attended a session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 68123fff456aaa111
 *     responses:
 *       200:
 *         description: Session participants fetched successfully
 *       400:
 *         description: Invalid session ID
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.get(
  "/sessions/:sessionId/participants",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  getSessionParticipants
);

/**
 * @swagger
 * /attendance/events/{id}/export:
 *   get:
 *     summary: Export attendance report as CSV
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 68123abc456def789
 *     responses:
 *       200:
 *         description: CSV exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid event ID
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get(
  "/events/:id/export",
  authMiddleware,
  requireRole("organizer", "volunteer"),
  exportAttendanceCSV
);

export default router;