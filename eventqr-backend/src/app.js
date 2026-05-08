import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/events.routes.js";
import sessionRoutes from "./routes/sessions.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";

import swaggerUi from "swagger-ui-express";
import specs from "./swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/volunteers", volunteerRoutes);

export default app;