# ЛР №2 — Бекенд без БД (Варіант 9: Заявки в техпідтримку)

## Запуск

```bash
npm install
npm run dev        # режим розробки (tsx watch)
npm run build      # компіляція в dist/
npm start          # запуск скомпільованої версії
```

Сервер запускається на **http://localhost:3000**

---

## Сутності

| Сутність | Маршрут |
|---|---|
| Users | `/api/users` |
| Tickets | `/api/tickets` |
| TicketMessages | `/api/tickets/:id/messages` |

---

## Приклади запитів (curl)

### Health check
```bash
curl -i http://localhost:3000/health
```

---

### Users

#### Створити користувача
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Іванов Іван","email":"ivan@example.com","role":"student"}'
```

#### Отримати список (з фільтром по ролі)
```bash
curl -i "http://localhost:3000/api/users?role=student"
```

#### Отримати за ID
```bash
curl -i http://localhost:3000/api/users/<USER_ID>
```

#### Оновити
```bash
curl -i -X PUT http://localhost:3000/api/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"name":"Іванов Петро"}'
```

#### Видалити
```bash
curl -i -X DELETE http://localhost:3000/api/users/<USER_ID>
```

---

### Tickets

#### Створити тікет
```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"subject":"Не працює принтер","message":"Принтер у кімнаті 302 не друкує","priority":"High","authorId":"<USER_ID>"}'
```

#### Отримати список (фільтрація + пагінація + сортування)
```bash
curl -i "http://localhost:3000/api/tickets?status=Open&priority=High&page=1&pageSize=5&sortBy=createdAt&sortDir=desc"
```

#### Отримати за ID
```bash
curl -i http://localhost:3000/api/tickets/<TICKET_ID>
```

#### Оновити статус
```bash
curl -i -X PUT http://localhost:3000/api/tickets/<TICKET_ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"InProgress"}'
```

#### Видалити
```bash
curl -i -X DELETE http://localhost:3000/api/tickets/<TICKET_ID>
```

---

### Ticket Messages

#### Додати повідомлення до тікету
```bash
curl -i -X POST http://localhost:3000/api/tickets/<TICKET_ID>/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Спробуйте перезавантажити принтер","authorId":"<USER_ID>"}'
```

#### Отримати повідомлення тікету
```bash
curl -i http://localhost:3000/api/tickets/<TICKET_ID>/messages
```

---

### Помилки валідації (приклад 400)

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
      { "field": "subject", "message": "subject є обов'язковим рядком (мін. 3 символів)" },
      { "field": "message", "message": "message є обов'язковим рядком (мін. 5 символів)" },
      { "field": "priority", "message": "priority має бути одним з: Low, Medium, High" },
      { "field": "authorId", "message": "authorId є обов'язковим рядком (мін. 1 символів)" }
    ]
  }
}
```

---

## Структура проекту

```
src/
  index.ts                      # Точка входу, Express app
  models.ts                     # Внутрішні моделі (entity)
  dtos/
    index.ts                    # DTO запитів і відповідей
  repositories/
    users.repository.ts
    tickets.repository.ts
    ticketMessages.repository.ts
  services/
    users.service.ts
    tickets.service.ts
    ticketMessages.service.ts
  controllers/
    users.controller.ts
    tickets.controller.ts
  routes/
    users.routes.ts
    tickets.routes.ts
  middleware/
    ApiError.ts
    errorHandler.ts
    requestLogger.ts
    validation.ts
```
