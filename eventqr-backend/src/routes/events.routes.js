import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createEvent, getMyEvents } from "../controllers/events.controller.js";
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
 * /api/events:
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
)


export default router;