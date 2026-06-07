"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const dbClient_1 = require("../db/dbClient");
function escStr(s) {
    return String(s ?? "").replace(/'/g, "''");
}
async function getAllUsers(roleFilter) {
    let sql = "SELECT id, email, name, role, createdAt FROM Users";
    if (roleFilter) {
        sql += ` WHERE role = '${escStr(roleFilter)}'`;
    }
    sql += " ORDER BY id DESC;";
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
async function getUserById(id) {
    const sql = `SELECT id, email, name, role, createdAt FROM Users WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.get)(sql);
}
async function createUser(dto) {
    const now = new Date().toISOString();
    const sql = `
    INSERT INTO Users (email, name, role, createdAt)
    VALUES ('${escStr(dto.email)}', '${escStr(dto.name)}', '${escStr(dto.role)}', '${now}');
  `;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    return (await getUserById(result.lastID));
}
async function updateUser(id, dto) {
    const fields = [];
    if (dto.name !== undefined)
        fields.push(`name = '${escStr(dto.name)}'`);
    if (dto.role !== undefined)
        fields.push(`role = '${escStr(dto.role)}'`);
    if (fields.length === 0)
        return getUserById(id) || null;
    const sql = `UPDATE Users SET ${fields.join(", ")} WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    if (result.changes === 0)
        return null;
    return (await getUserById(id)) ?? null;
}
async function deleteUser(id) {
    const sql = `DELETE FROM Users WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    return result.changes > 0;
}
