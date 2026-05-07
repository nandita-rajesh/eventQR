import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addParticipant, addSession, createEvent, deleteEvent, getEventById, getMyEvents, updateEvent } from "../controllers/events.controller.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

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
    "/" , 
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

router.post(
    "/:id/partcipant",
    authMiddleware,
    requireRole("organizer"),
    addParticipant
);


router.get(
    "/:id/participant",
    authMiddleware,
    requireRole("organizer", "volunteer"),
    
)
export default router;