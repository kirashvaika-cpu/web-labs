"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findById = findById;
exports.create = create;
exports.update = update;
exports.remove = remove;
// src/repositories/users.repository.ts
const uuid_1 = require("uuid");
const dbClient_1 = require("../db/dbClient");
const VALID_ROLES = ["student", "teacher", "admin", "support"];
async function findAll(role, sort = "createdAt", order = "desc") {
    const allowedSort = ["id", "name", "email", "role", "createdAt"].includes(sort)
        ? sort
        : "createdAt";
    const allowedOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";
    const where = role && VALID_ROLES.includes(role) ? `WHERE role = '${(0, dbClient_1.esc)(role)}'` : "";
    return await (0, dbClient_1.all)(`
    SELECT id, name, email, role, createdAt
    FROM Users
    ${where}
    ORDER BY ${allowedSort} ${allowedOrder};
  `);
}
async function findById(id) {
    return await (0, dbClient_1.get)(`
    SELECT id, name, email, role, createdAt
    FROM Users
    WHERE id = '${(0, dbClient_1.esc)(id)}';
  `);
}
async function create(dto) {
    const id = (0, uuid_1.v4)();
    const role = dto.role ?? "student";
    const now = new Date().toISOString();
    await (0, dbClient_1.run)(`
    INSERT INTO Users (id, name, email, role, createdAt)
    VALUES ('${id}', '${(0, dbClient_1.esc)(dto.name)}', '${(0, dbClient_1.esc)(dto.email)}', '${(0, dbClient_1.esc)(role)}', '${now}');
  `);
    return (await findById(id));
}
async function update(id, dto) {
    const fields = [];
    if (dto.name !== undefined)
        fields.push(`name = '${(0, dbClient_1.esc)(dto.name)}'`);
    if (dto.role !== undefined)
        fields.push(`role = '${(0, dbClient_1.esc)(dto.role)}'`);
    if (fields.length === 0)
        return (await findById(id)) ?? null;
    const result = await (0, dbClient_1.run)(`
    UPDATE Users SET ${fields.join(", ")} WHERE id = '${(0, dbClient_1.esc)(id)}';
  `);
    return result.changes === 0 ? null : (await findById(id));
}
async function remove(id) {
    const result = await (0, dbClient_1.run)(`DELETE FROM Users WHERE id = '${(0, dbClient_1.esc)(id)}';`);
    return result.changes > 0;
}
