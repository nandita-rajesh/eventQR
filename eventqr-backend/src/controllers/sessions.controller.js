import { updateSessionService } from "../services/sessions.service.js";

export const updateSession = async (req, res) => {
    try {
        const session = await updateSessionService(
            req.params.sessionId,
            req.user,
            req.body
        );

        return res.json(session);

    } catch(err){
        if (err.message === "Invalid session ID") {
            return res.status(400).json({ error: err.message });
        }

        if (err.message === "Session not found") {
            return res.status(404).json({ error: err.message });
        }

        if (err.message === "Unauthorized") {
            return res.status(403).json({ error: err.message });
        }

        if (err.message === "Invalid session time") {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({error: err.message});
    }
}