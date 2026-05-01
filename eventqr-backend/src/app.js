import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import swaggerUi from "swagger-ui-express";
import specs from "./swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/auth", authRoutes);

export default app;