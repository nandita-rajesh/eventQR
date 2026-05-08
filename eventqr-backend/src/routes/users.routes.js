import express from "express";
import { searchVolunteers } from "../controllers/users.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /users/volunteers/search:
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
  "/volunteers/search",
  authMiddleware,
  requireRole("organizer"),
  searchVolunteers
);

export default router;