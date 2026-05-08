import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { deleteSession, updateSession } from "../controllers/sessions.controller.js";

const router = express.Router();

/**
 * @swagger
 * /sessions/{sessionId}:
 *   put:
 *     summary: Update a session (organizer only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 70a123abc456def7890abcd1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Opening Ceremony
 *               description:
 *                 type: string
 *                 example: Updated intro session
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-10T09:30:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-10T10:30:00Z
 *     responses:
 *       200:
 *         description: Session updated successfully
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
 *                 description:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input or session ID
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not organizer or not owner)
 *       404:
 *         description: Session not found
 */
router.put(
  "/:sessionId",
  authMiddleware,
  requireRole("organizer"),
  updateSession
);

/**
 * @swagger
 * /sessions/{sessionId}:
 *   delete:
 *     summary: Delete a session (organizer only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 70a123abc456def7890abcd1
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Session deleted successfully
 *       400:
 *         description: Invalid session ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not organizer or not owner)
 *       404:
 *         description: Session not found
 */
router.delete(
    "/:sessionId",
    authMiddleware,
    requireRole("organizer"),
    deleteSession
)

export default router;