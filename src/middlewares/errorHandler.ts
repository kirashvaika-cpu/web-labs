import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const msg = String(err && (err as Error).message ? (err as Error).message : err);

  if (msg.includes("UNIQUE constraint failed")) {
    const field = msg.split(": ").pop() ?? "field";
    res.status(409).json({ error: `Unique constraint violation: ${field}` });
    return;
  }

  if (msg.includes("NOT NULL constraint failed")) {
    res.status(400).json({ error: "Required field is missing" });
    return;
  }

  if (msg.includes("CHECK constraint failed")) {
    res.status(400).json({ error: "Invalid value for constrained field" });
    return;
  }

  if (msg.includes("FOREIGN KEY constraint failed")) {
    res.status(400).json({ error: "Referenced entity does not exist" });
    return;
  }

  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
}
