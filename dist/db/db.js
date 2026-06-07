"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// src/db/db.ts
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const dataDir = path_1.default.join(__dirname, "..", "..", "data");
const dbPath = path_1.default.join(dataDir, "app.db");
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
exports.db = new (sqlite3_1.default.verbose().Database)(dbPath, (err) => {
    if (err) {
        console.error("[DB] Failed to open SQLite:", err.message);
        process.exit(1);
    }
    console.log("[DB] SQLite opened:", dbPath);
});
