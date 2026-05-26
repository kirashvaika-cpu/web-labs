import express from "express";
import usersRoutes from "./routes/users.routes";
import ticketsRoutes from "./routes/tickets.routes";
import ticketMessagesRoutes from "./routes/ticketMessages.routes";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/tickets/:ticketId/messages", ticketMessagesRoutes);

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);
