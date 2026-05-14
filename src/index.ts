import express from "express";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { usersRouter } from "./routes/users.routes";
import { ticketsRouter } from "./routes/tickets.routes";

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ──────────────────────────────────
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(requestLogger);

// ── Routes ──────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

// ── 404 handler ─────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Маршрут не знайдено" } });
});

// ── Error handler (завжди останній) ─────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ API запущено: http://localhost:${PORT}`);
  console.log(`   GET /health`);
  console.log(`   GET /api/users`);
  console.log(`   GET /api/tickets`);
});

export default app;
