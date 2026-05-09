import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addParticipant, addSession, assignVolunteer, createEvent, deleteEvent, getEventAttendanceSummary, getEventById, getMyEvents, getParticipants, resendParticipantQr, searchParticipants, updateEvent, uploadParticipantsCSV } from "../controllers/events.controller.js";
import { requireRole } from "../middleware/role.middleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({
    dest: "uploads/",
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - venue
 *             properties:
 *               title:
 *                 type: string
 *                 example: Hackathon 2026
 *               description:
 *                 type: string
 *                 example: 24 hour coding event
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-10
 *               venue:
 *                 type: string
 *                 example: Amrita Hall
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not an organizer)
 */
router.post(
    "/",
    authMiddleware,
    requireRole("organizer"),
    createEvent
);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events created by the logged-in organizer
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 69f33253f9bfd1034e14cd6f
 *                   title:
 *                     type: string
 *                     example: Hackathon 2026
 *                   description:
 *                     type: string
 *                     example: 24 hour coding event
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: 2026-05-10
 *                   venue:
 *                     type: string
 *                     example: Amrita Hall
 *                   organizer:
 *                     type: string
 *                     example: 69f33253f9bfd1034e14cd6f
 *                   sessions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: Opening Ceremony
 *                         startTime:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-10T09:00:00Z
 *                         endTime:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-10T10:00:00Z
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       403:
 *         description: Forbidden (not an organizer)
 */
router.get(
    "/",
    authMiddleware,
    requireRole("organizer"),
    getMyEvents
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event details (organizer only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid event ID
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not owner or not organizer)
 *       404:
 *         description: Event not found
 */
router.get(
    "/:id",
    authMiddleware,
    requireRole("organizer"),
    getEventById
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event (organizer only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Hackathon
 *               description:
 *                 type: string
 *                 example: Updated description
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-10
 *               venue:
 *                 type: string
 *                 example: New Venue
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid request or ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not owner or not organizer)
 *       404:
 *         description: Event not found
 */
router.put(
    "/:id",
    authMiddleware,
    requireRole("organizer"),
    updateEvent
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event (organizer only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Event deleted successfully
 *       400:
 *         description: Invalid event ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not owner or not organizer)
 *       404:
 *         description: Event not found
 */
router.delete(
    "/:id",
    authMiddleware,
    requireRole("organizer"),
    deleteEvent
);

/**
 * @swagger
 * /events/{id}/sessions:
 *   post:
 *     summary: Add a session to an event (organizer only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startTime
 *               - endTime
 *             properties:
 *               name:
 *                 type: string
 *                 example: Opening Ceremony
 *               description:
 *                 type: string
 *                 example: Welcome and introduction
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-10T09:00:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-10T10:00:00Z
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 70a123abc456def7890abcd1
 *                 name:
 *                   type: string
 *                   example: Opening Ceremony
 *                 description:
 *                   type: string
 *                   example: Welcome and introduction
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-10T09:00:00Z
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-10T10:00:00Z
 *       400:
 *         description: Invalid input or session time
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not organizer or not owner)
 *       404:
 *         description: Event not found
 */
router.post(
    "/:id/sessions",
    authMiddleware,
    requireRole("organizer"),
    addSession
);

/**
 * @swagger
 * /events/{id}/participants:
 *   post:
 *     summary: Add a participant to an event
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Chinmay
 *               email:
 *                 type: string
 *                 example: chinmay@gmail.com
 *               phoneNumber:
 *                 type: string
 *                 example: 9999999999
 *     responses:
 *       201:
 *         description: Participant added successfully
 *       400:
 *         description: Invalid input or duplicate participant
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.post(
    "/:id/participants",
    authMiddleware,
    requireRole("organizer"),
    addParticipant
);

/**
 * @swagger
 * /events/{id}/participants:
 *   get:
 *     summary: Get all participants for an event
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     responses:
 *       200:
 *         description: Participants fetched successfully
 *       400:
 *         description: Invalid event ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.get(
    "/:id/participants",
    authMiddleware,
    requireRole("organizer", "volunteer"),
    getParticipants
);

/**
 * @swagger
 * /events/{id}/participants/upload:
 *   post:
 *     summary: Upload participants via CSV
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Participants uploaded successfully
 *       400:
 *         description: Invalid CSV or invalid event ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.post(
    "/:id/participants/upload",
    authMiddleware,
    requireRole("organizer"),
    upload.single("file"),
    uploadParticipantsCSV
);

/**
 * @swagger
 * /events/{id}/participants/search:
 *   get:
 *     summary: Search participants by name or email
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: chin
 *     responses:
 *       200:
 *         description: Matching participants fetched successfully
 *       400:
 *         description: Invalid event ID or missing query
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.get(
    "/:id/participants/search",
    authMiddleware,
    requireRole("organizer", "volunteer"),
    searchParticipants
);

/**
 * @swagger
 * /events/{id}/volunteers:
 *   post:
 *     summary: Assign a volunteer to an event
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69f33253f9bfd1034e14cd6f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - volunteerId
 *             properties:
 *               volunteerId:
 *                 type: string
 *                 example: 69f44efe92f62ce0cbcbeaf0
 *     responses:
 *       201:
 *         description: Volunteer assigned successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Volunteer assigned successfully
 *       400:
 *         description: Invalid request or duplicate assignment
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not organizer or not owner)
 *       404:
 *         description: Event or volunteer not found
 */
router.post(
  "/:eventId/volunteers",
  authMiddleware,
  requireRole("organizer"),
  assignVolunteer
);

export default router;