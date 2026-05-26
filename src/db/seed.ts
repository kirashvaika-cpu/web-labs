// src/db/seed.ts
// Запуск: npm run seed
// Очищає і заповнює базу тестовими даними
import { v4 as uuidv4 } from "uuid";
import { migrate } from "./migrate";
import { run, esc } from "./dbClient";

async function seed(): Promise<void> {
  await migrate();

  console.log("[seed] Clearing tables...");
  await run("DELETE FROM TicketMessages;");
  await run("DELETE FROM Tickets;");
  await run("DELETE FROM Users;");

  const now = new Date().toISOString();

  // ── Users ──────────────────────────────────────────────────────────────
  console.log("[seed] Inserting users...");

  const u1 = uuidv4(), u2 = uuidv4(), u3 = uuidv4(), u4 = uuidv4();

  await run(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u1}', 'Іванов Іван', 'ivan@example.com', 'student', '${now}');`);
  await run(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u2}', 'Петренко Марія', 'maria@example.com', 'student', '${now}');`);
  await run(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u3}', 'Коваленко Олексій', 'support@example.com', 'support', '${now}');`);
  await run(`INSERT INTO Users (id, name, email, role, createdAt) VALUES
    ('${u4}', 'Адмін Системи', 'admin@example.com', 'admin', '${now}');`);

  // ── Tickets ────────────────────────────────────────────────────────────
  console.log("[seed] Inserting tickets...");

  const t1 = uuidv4(), t2 = uuidv4(), t3 = uuidv4(), t4 = uuidv4(), t5 = uuidv4();

  await run(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t1}', 'Не працює принтер', 'Принтер у кімнаті 302 не друкує з понеділка', 'High', 'Open', '${u1}', '${now}', '${now}');`);
  await run(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t2}', 'Немає доступу до Wi-Fi', 'Не можу підключитися до мережі університету', 'Medium', 'InProgress', '${u1}', '${now}', '${now}');`);
  await run(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t3}', 'Зависає комп''ютер в аудиторії 101', 'ПК постійно зависає під час роботи', 'High', 'Open', '${u2}', '${now}', '${now}');`);
  await run(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t4}', 'Запит на нове ПЗ', 'Потрібен Microsoft Project для курсової', 'Low', 'Resolved', '${u2}', '${now}', '${now}');`);
  await run(`INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt) VALUES
    ('${t5}', 'Проблема з VPN', 'VPN-клієнт не з''єднується з корпоративною мережею', 'Medium', 'Closed', '${u1}', '${now}', '${now}');`);

  // ── TicketMessages ─────────────────────────────────────────────────────
  console.log("[seed] Inserting messages...");

  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t1}', '${u1}', 'Спробував перезавантажити — не допомогло', '${now}');`);
  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t1}', '${u3}', 'Можете уточнити модель принтера?', '${now}');`);
  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t1}', '${u1}', 'HP LaserJet Pro M404dn', '${now}');`);

  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t2}', '${u3}', 'Перевіряємо налаштування на точці доступу', '${now}');`);
  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t2}', '${u1}', 'Дякую, чекаю на відповідь', '${now}');`);

  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t4}', '${u3}', 'ПЗ встановлено, перевірте доступ', '${now}');`);
  await run(`INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt) VALUES
    ('${uuidv4()}', '${t4}', '${u2}', 'Підтверджую, все працює. Дякую!', '${now}');`);

  console.log("[seed] Done! Inserted: 4 users, 5 tickets, 7 messages.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
