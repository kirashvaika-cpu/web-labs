// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const msg = String((err as Error)?.message ?? err);

  // UNIQUE constraint → 409
  if (msg.includes("UNIQUE constraint failed")) {
    const field = msg.split("UNIQUE constraint failed: ")[1] ?? "field";
    res.status(409).json({
      error: { code: "CONFLICT", message: `Duplicate value: ${field}` },
    });
    return;
  }

  // NOT NULL constraint → 400
  if (msg.includes("NOT NULL constraint failed")) {
    const field = msg.split("NOT NULL constraint failed: ")[1] ?? "field";
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: `Required field missing: ${field}` },
    });
    return;
  }

  // CHECK constraint → 400
  if (msg.includes("CHECK constraint failed")) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid value (CHECK constraint failed)" },
    });
    return;
  }

  // FOREIGN KEY → 422
  if (msg.includes("FOREIGN KEY constraint failed")) {
    res.status(422).json({
      error: { code: "REFERENCE_ERROR", message: "Referenced entity does not exist" },
    });
    return;
  }

  // Решта → 500
  console.error("[ERROR]", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal Server Error" },
  });
}
