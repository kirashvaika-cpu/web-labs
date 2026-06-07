// src/db/db.ts
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new (sqlite3.verbose().Database)(dbPath, (err) => {
  if (err) {
    console.error("[DB] Failed to open SQLite:", err.message);
    process.exit(1);
  }
  console.log("[DB] SQLite opened:", dbPath);
});
