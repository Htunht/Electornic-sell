import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import adminRoutes from "./routes/admin/index";
import apiRoutes from "./routes/apiRoutes";

const app = express();

// 1. CORS — must be first
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  })
);

// 2. Better-auth MUST come BEFORE express.json() — it parses its own body
app.use("/api/auth", toNodeHandler(auth));

// 3. JSON body parser for all other routes
app.use(express.json());

// 4. Request logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} | cookie: ${req.headers.cookie ? "present" : "absent"}`);
  next();
});

// 5. API Routes (Directly in app.ts for maximum reliability)
app.use("/api/v1", apiRoutes);
app.use("/api/admin", adminRoutes);

// 6. Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "University Management API" });
});

// 7. 404 fallback
app.use((req: express.Request, res: express.Response) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ error: "Route not found", path: req.path });
});

export default app;
