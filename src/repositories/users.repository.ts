// src/repositories/users.repository.ts
import { v4 as uuidv4 } from "uuid";
import { all, get, run, esc } from "../db/dbClient";
import { User, CreateUserDto, UpdateUserDto, UserRole } from "../models/models";

const VALID_ROLES: UserRole[] = ["student", "teacher", "admin", "support"];

export async function findAll(
  role?:  string,
  sort:   string = "createdAt",
  order:  string = "desc"
): Promise<User[]> {
  const allowedSort  = ["id", "name", "email", "role", "createdAt"].includes(sort) ? sort : "createdAt";
  const allowedOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  const where = role && VALID_ROLES.includes(role as UserRole)
    ? `WHERE role = '${esc(role)}'` : "";

  return await all<User>(`
    SELECT id, name, email, role, createdAt
    FROM Users
    ${where}
    ORDER BY ${allowedSort} ${allowedOrder};
  `);
}

export async function findById(id: string): Promise<User | undefined> {
  return await get<User>(`
    SELECT id, name, email, role, createdAt
    FROM Users
    WHERE id = '${esc(id)}';
  `);
}

export async function create(dto: CreateUserDto): Promise<User> {
  const id   = uuidv4();
  const role = dto.role ?? "student";
  const now  = new Date().toISOString();

  await run(`
    INSERT INTO Users (id, name, email, role, createdAt)
    VALUES ('${id}', '${esc(dto.name)}', '${esc(dto.email)}', '${esc(role)}', '${now}');
  `);

  return (await findById(id))!;
}

export async function update(id: string, dto: UpdateUserDto): Promise<User | null> {
  const fields: string[] = [];
  if (dto.name !== undefined) fields.push(`name = '${esc(dto.name)}'`);
  if (dto.role !== undefined) fields.push(`role = '${esc(dto.role)}'`);
  if (fields.length === 0) return (await findById(id)) ?? null;

  const result = await run(`
    UPDATE Users SET ${fields.join(", ")} WHERE id = '${esc(id)}';
  `);

  return result.changes === 0 ? null : (await findById(id))!;
}

export async function remove(id: string): Promise<boolean> {
  const result = await run(`DELETE FROM Users WHERE id = '${esc(id)}';`);
  return result.changes > 0;
}
