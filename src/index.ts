// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import { migrate } from "./db/migrate";
import { errorHandler } from "./middleware/errorHandler";
import { ticketsRouter } from "./routes/tickets.routes";
import { usersRouter } from "./routes/users.routes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// Налаштування заголовків CORS стандартними засобами Express
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// МАРШРУТИ (ROUTES)
// ─────────────────────────────────────────────────────────────────────────────
// Підключаємо наші модульні роутери з папки routes
app.use("/api/tickets", ticketsRouter);
app.use("/api/users", usersRouter);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await migrate();
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[server] Fatal error:", err);
  process.exit(1);
});
