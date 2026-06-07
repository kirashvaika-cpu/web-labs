"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const migrate_1 = require("./db/migrate");
const errorHandler_1 = require("./middleware/errorHandler");
const tickets_routes_1 = require("./routes/tickets.routes");
const users_routes_1 = require("./routes/users.routes");
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.use(express_1.default.json());
// Налаштування заголовків CORS стандартними засобами Express
app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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
app.use("/api/tickets", tickets_routes_1.ticketsRouter);
app.use("/api/users", users_routes_1.usersRouter);
// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────
async function bootstrap() {
    await (0, migrate_1.migrate)();
    app.listen(PORT, () => {
        console.log(`[server] Running on http://localhost:${PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error("[server] Fatal error:", err);
    process.exit(1);
});
