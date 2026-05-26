# ЛР №3 — SQLite: Реляційна БД, CRUD, Міграції (Варіант 9: Заявки в техпідтримку)

## Запуск

```bash
npm install
npm run dev        # режим розробки (tsx watch) + авто-міграції
npm run seed       # заповнення тестовими даними (4 users, 5 tickets, 7 messages)
npm run build      # компіляція в dist/
npm start          # запуск скомпільованої версії
```

Сервер запускається на **http://localhost:3000**

> При кожному старті автоматично виконуються нові міграції з папки `migrations/`.

---

## Де зберігається база даних

```
./data/app.db    ← створюється автоматично при першому запуску
```

Файл `data/*.db` **не комітиться** в репозиторій (`.gitignore`).

---

## Схема БД

### Таблиці та зв'язки

```
Users (1) ────────────< Tickets (N)
Users (1) ────────────< TicketMessages (N)   [автор повідомлення]
Tickets (1) ──────────< TicketMessages (N)
```

### Users

| Поле      | Тип  | Обмеження                                                    |
|-----------|------|--------------------------------------------------------------|
| id        | TEXT | PRIMARY KEY (uuid)                                           |
| name      | TEXT | NOT NULL                                                     |
| email     | TEXT | NOT NULL UNIQUE                                              |
| role      | TEXT | NOT NULL CHECK(role IN ('student','teacher','admin','support')) |
| createdAt | TEXT | NOT NULL — ISO-8601                                          |

### Tickets

| Поле      | Тип  | Обмеження                                                           |
|-----------|------|---------------------------------------------------------------------|
| id        | TEXT | PRIMARY KEY (uuid)                                                  |
| subject   | TEXT | NOT NULL                                                            |
| message   | TEXT | NOT NULL                                                            |
| priority  | TEXT | NOT NULL CHECK(priority IN ('Low','Medium','High'))                  |
| status    | TEXT | NOT NULL CHECK(status IN ('Open','InProgress','Resolved','Closed')) |
| authorId  | TEXT | NOT NULL, FK → Users(id) ON DELETE RESTRICT                         |
| createdAt | TEXT | NOT NULL                                                            |
| updatedAt | TEXT | NOT NULL                                                            |

> `ON DELETE RESTRICT` — не можна видалити користувача, якщо він є автором тікету. Це захищає від «висячих» тікетів без автора.

### TicketMessages

| Поле      | Тип  | Обмеження                                              |
|-----------|------|--------------------------------------------------------|
| id        | TEXT | PRIMARY KEY (uuid)                                     |
| ticketId  | TEXT | NOT NULL, FK → Tickets(id) ON DELETE CASCADE           |
| authorId  | TEXT | NOT NULL, FK → Users(id) ON DELETE RESTRICT            |
| text      | TEXT | NOT NULL                                               |
| createdAt | TEXT | NOT NULL                                               |

> `ON DELETE CASCADE` — при видаленні тікету автоматично видаляються всі його повідомлення.

### schema_migrations (службова)

Зберігає перелік застосованих міграцій. При старті `migrate()` застосовує лише нові файли з `migrations/`.

---

## Міграції

```
migrations/
  001_create_users.sql
  002_create_tickets.sql
  003_create_ticket_messages.sql
  004_add_indexes.sql         ← індекс idx_tickets_authorId (для JOIN/фільтру)
  005_add_messages_index.sql  ← індекс idx_messages_ticketId (для вибірки повідомлень)
```

Індекси прискорюють типові запити `WHERE authorId = ?` та `WHERE ticketId = ?`.

---

## API Endpoints

### Health check

```
GET /health
```

### Users

| Метод  | URL            | Опис                                             |
|--------|----------------|--------------------------------------------------|
| GET    | /api/users     | Список (`?role=student&sortBy=name&sortDir=asc`) |
| GET    | /api/users/:id | Користувач за id                                 |
| POST   | /api/users     | Створити                                         |
| PUT    | /api/users/:id | Оновити (name, role)                             |
| DELETE | /api/users/:id | Видалити (RESTRICT якщо є тікети)                |

### Tickets

| Метод  | URL                    | Опис                                                                 |
|--------|------------------------|----------------------------------------------------------------------|
| GET    | /api/tickets           | Список з фільтрацією, сортуванням, пагінацією                        |
| GET    | /api/tickets/stats     | **Агрегація**: COUNT/GROUP BY/AVG                                     |
| GET    | /api/tickets/search    | Пошук по subject (⚠️ SQLi-демонстрація)                              |
| GET    | /api/tickets/:id       | Тікет за id (з JOIN — authorName, authorEmail)                       |
| POST   | /api/tickets           | Створити                                                             |
| PUT    | /api/tickets/:id       | Оновити (subject, message, priority, status)                         |
| DELETE | /api/tickets/:id       | Видалити (CASCADE → messages)                                        |

### TicketMessages

| Метод  | URL                                   | Опис                              |
|--------|---------------------------------------|-----------------------------------|
| GET    | /api/tickets/:id/messages             | Повідомлення тікету (JOIN author) |
| POST   | /api/tickets/:id/messages             | Додати повідомлення               |
| DELETE | /api/tickets/:id/messages/:messageId  | Видалити повідомлення             |

---

## Приклади запитів (curl)

### Health check
```bash
curl -i http://localhost:3000/health
```

### Створити користувача
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Іванов Іван","email":"ivan@example.com","role":"student"}'
```

### Список тікетів з фільтрацією (WHERE + ORDER BY + LIMIT)
```bash
curl -i "http://localhost:3000/api/tickets?status=Open&priority=High&page=1&pageSize=5&sortBy=createdAt&sortDir=desc"
```

### Тікет з автором (JOIN)
```bash
curl -i http://localhost:3000/api/tickets/<TICKET_ID>
```

### Статистика (агрегація)
```bash
curl -i http://localhost:3000/api/tickets/stats
```
Відповідь:
```json
{
  "data": {
    "total": 5,
    "byStatus":   { "Open": 2, "InProgress": 1, "Resolved": 1, "Closed": 1 },
    "byPriority": { "High": 2, "Medium": 2, "Low": 1 },
    "avgMessagesPerTicket": 2.33
  }
}
```

### Повідомлення тікету (JOIN)
```bash
curl -i http://localhost:3000/api/tickets/<TICKET_ID>/messages
```

### Додати повідомлення
```bash
curl -i -X POST http://localhost:3000/api/tickets/<TICKET_ID>/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Спробуйте перезавантажити принтер","authorId":"<USER_ID>"}'
```

### Оновити статус тікету
```bash
curl -i -X PUT http://localhost:3000/api/tickets/<TICKET_ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"InProgress"}'
```

### Помилка валідації (400)
```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"subject":"","priority":"INVALID"}'
```
Відповідь:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некоректні дані запиту",
    "details": [
      { "field": "subject",  "message": "subject є обов'язковим рядком (мін. 3 символів)" },
      { "field": "message",  "message": "message є обов'язковим рядком (мін. 5 символів)" },
      { "field": "priority", "message": "priority має бути одним з: Low, Medium, High" },
      { "field": "authorId", "message": "authorId є обов'язковим рядком (мін. 1 символів)" }
    ]
  }
}
```

---

## ⚠️ SQLi-демонстрація

Endpoint `GET /api/tickets/search?q=...` навмисно **небезпечний**:

```sql
WHERE t.subject LIKE '%<q>%'
```

**Приклад небезпечного вводу:**
```
GET /api/tickets/search?q=%25' OR '1'='1
```

Формований SQL:
```sql
WHERE t.subject LIKE '%' OR '1'='1%'
```

Умова `'1'='1'` завжди TRUE → повертаються **всі тікети**, незалежно від фільтра. Це SQL Injection.  
Виправлення — параметризовані запити (ЛР №5).

---

## HTTP-коди

| Код | Ситуація |
|-----|----------|
| 200 | Успішне читання |
| 201 | Успішне створення |
| 204 | Успішне видалення |
| 400 | Некоректні дані / NOT NULL / CHECK constraint |
| 404 | Ресурс не знайдено |
| 409 | Дублікат (UNIQUE constraint) |
| 422 | Порушення FK (referenced record not found) |
| 500 | Внутрішня помилка |

---

## Структура проекту

```
src/
  index.ts                       — точка входу: Express, роути, bootstrap
  models/
    models.ts                    — типи: User, Ticket, TicketMessage + DTO
  repositories/
    users.repository.ts          — SQL-запити для Users
    tickets.repository.ts        — SQL-запити для Tickets + stats + SQLi-demo
    ticketMessages.repository.ts — SQL-запити для TicketMessages
  db/
    db.ts                        — відкриття SQLite файлу
    dbClient.ts                  — all/get/run + esc (Promise wrappers)
    migrate.ts                   — runner міграцій (schema_migrations)
    seed.ts                      — тестові дані
  middleware/
    errorHandler.ts              — централізована обробка помилок → HTTP-коди
migrations/
  001_create_users.sql
  002_create_tickets.sql
  003_create_ticket_messages.sql
  004_add_indexes.sql
  005_add_messages_index.sql
data/
  app.db                         — (не в git) SQLite файл
```
