import { all, get, run, logSql } from "../db/dbClient";
import { UserDto, CreateUserDto, UpdateUserDto } from "../dtos";

function escStr(s: unknown): string {
  return String(s ?? "").replace(/'/g, "''");
}

export async function getAllUsers(roleFilter?: string): Promise<UserDto[]> {
  let sql = "SELECT id, email, name, role, createdAt FROM Users";
  if (roleFilter) {
    sql += ` WHERE role = '${escStr(roleFilter)}'`;
  }
  sql += " ORDER BY id DESC;";
  logSql(sql);
  return all<UserDto>(sql);
}

export async function getUserById(id: number): Promise<UserDto | undefined> {
  const sql = `SELECT id, email, name, role, createdAt FROM Users WHERE id = ${id};`;
  logSql(sql);
  return get<UserDto>(sql);
}

export async function createUser(dto: CreateUserDto): Promise<UserDto> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Users (email, name, role, createdAt)
    VALUES ('${escStr(dto.email)}', '${escStr(dto.name)}', '${escStr(dto.role)}', '${now}');
  `;
  logSql(sql);
  const result = await run(sql);
  return (await getUserById(result.lastID))!;
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<UserDto | null> {
  const fields: string[] = [];
  if (dto.name !== undefined) fields.push(`name = '${escStr(dto.name)}'`);
  if (dto.role !== undefined) fields.push(`role = '${escStr(dto.role)}'`);
  if (fields.length === 0) return (getUserById(id) as unknown as UserDto) || null;

  const sql = `UPDATE Users SET ${fields.join(", ")} WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  if (result.changes === 0) return null;
  return (await getUserById(id)) ?? null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const sql = `DELETE FROM Users WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  return result.changes > 0;
}
