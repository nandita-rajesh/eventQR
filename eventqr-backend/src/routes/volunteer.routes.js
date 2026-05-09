import express from "express";
import { getAssignedEvents, getVolunteerEventDetails, searchVolunteers } from "../controllers/volunteer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /volunteers/search:
 *   get:
 *     summary: Search volunteers by name or email
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: chinmay
 *         description: Name or email search query
 *     responses:
 *       200:
 *         description: List of matching volunteers
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
 *                   name:
 *                     type: string
 *                     example: Chinmay Ajith
 *                   email:
 *                     type: string
 *                     example: chinmay@gmail.com
 *                   role:
 *                     type: string
 *                     example: volunteer
 *       400:
 *         description: Missing search query
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not organizer)
 */
router.get(
  "/search",
  authMiddleware,
  requireRole("organizer"),
  searchVolunteers
);

/**
 * @swagger
 * /volunteers/me/events:
 *   get:
 *     summary: Get events assigned to the logged-in volunteer
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned events fetched successfully
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
 *                     example: Annual coding competition
 *                   venue:
 *                     type: string
 *                     example: Main Auditorium
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: 2026-03-10
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not a volunteer)
 */
router.get(
  "/me/events",
  authMiddleware,
  requireRole("volunteer"),
  getAssignedEvents
);

router.get(
  "/events/:eventId",
  authMiddleware,
  requireRole("volunteer"),
  getVolunteerEventDetails
);

export default router;