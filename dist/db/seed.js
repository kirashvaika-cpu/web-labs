"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db/seed.ts
// Запуск: npm run seed
// Очищає і заповнює базу тестовими даними
const uuid_1 = require("uuid");
const migrate_1 = require("./migrate");
const dbClient_1 = require("./dbClient");
async function seed() {
    await (0, migrate_1.migrate)();
    console.log("[seed] Clearing tables...");
    await (0, dbClient_1.run)("DELETE FROM TicketMessages;");
    await (0, dbClient_1.run)("DELETE FROM Tickets;");
    await (0, dbClient_1.run)("DELETE FROM Users;");
    const now = new Date().toISOString();
    // ── Users ──────────────────────────────────────────────────────────────
    console.log("[seed] Inserting users...");
    const u1 = (0, uuid_1.v4)(), u2 = (0, uuid_1.v4)(), u3 = (0, uuid_1.v4)(), u4 = (0, uuid_1.v4)();
    await (0, dbClient_1.run)(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u1}', 'Іванов Іван', 'ivan@example.com', 'student', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u2}', 'Петренко Марія', 'maria@example.com', 'student', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u3}', 'Коваленко Олексій', 'support@example.com', 'support', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u4}', 'Адмін Системи', 'admin@example.com', 'admin', '${now}');`);
    // ── Tickets ────────────────────────────────────────────────────────────
    console.log("[seed] Inserting tickets...");
    const t1 = (0, uuid_1.v4)(), t2 = (0, uuid_1.v4)(), t3 = (0, uuid_1.v4)(), t4 = (0, uuid_1.v4)(), t5 = (0, uuid_1.v4)();
    await (0, dbClient_1.run)(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t1}', 'Не працює принтер', 'Принтер у кімнаті 302 не друкує з понеділка', 'High', 'Open', '${u1}', '${now}', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t2}', 'Немає доступу до Wi-Fi', 'Не можу підключитися до мережі університету', 'Medium', 'InProgress', '${u1}', '${now}', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t3}', 'Зависає комп''ютер в аудиторії 101', 'ПК постійно зависає під час роботи', 'High', 'Open', '${u2}', '${now}', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t4}', 'Запит на нове ПЗ', 'Потрібен Microsoft Project для курсової', 'Low', 'Resolved', '${u2}', '${now}', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t5}', 'Проблема з VPN', 'VPN-клієнт не з''єднується з корпоративною мережею', 'Medium', 'Closed', '${u1}', '${now}', '${now}');`);
    // ── TicketMessages ─────────────────────────────────────────────────────
    console.log("[seed] Inserting messages...");
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t1}', '${u1}', 'Спробував перезавантажити — не допомогло', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t1}', '${u3}', 'Можете уточнити модель принтера?', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t1}', '${u1}', 'HP LaserJet Pro M404dn', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t2}', '${u3}', 'Перевіряємо налаштування на точці доступу', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t2}', '${u1}', 'Дякую, чекаю на відповідь', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t4}', '${u3}', 'ПЗ встановлено, перевірте доступ', '${now}');`);
    await (0, dbClient_1.run)(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${(0, uuid_1.v4)()}', '${t4}', '${u2}', 'Підтверджую, все працює. Дякую!', '${now}');`);
    console.log("[seed] Done! Inserted: 4 users, 5 tickets, 7 messages.");
    process.exit(0);
}
seed().catch((err) => {
    console.error("[seed] Error:", err);
    process.exit(1);
});
