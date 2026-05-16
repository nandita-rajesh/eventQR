import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import multer from "multer";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/events.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";

import swaggerUi from "swagger-ui-express";
import specs from "./swagger.js";

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

// Global rate limiter
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // limit each IP to 200 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/volunteers", volunteerRoutes);

export default app;

app.use((err, req, res, next) => {
	if (err && err.code === "LIMIT_FILE_SIZE") {
		return res.status(400).json({ error: "CSV file exceeds size limit (5 MB)" });
	}

	if (err instanceof multer.MulterError) {
		return res.status(400).json({ error: err.message });
	}

	if (err && err.message && (err.message.includes("CSV") || err.message.includes("Only CSV"))) {
		return res.status(400).json({ error: err.message });
	}

	console.error(err);
	return res.status(500).json({ error: "Internal server error" });
});