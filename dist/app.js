"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const tickets_routes_1 = __importDefault(require("./routes/tickets.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
// Request logger
exports.app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
exports.app.use("/api/users", users_routes_1.default);
exports.app.use("/api/tickets", tickets_routes_1.default);
// 404 for unknown routes
exports.app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
exports.app.use(errorHandler_1.errorHandler);
