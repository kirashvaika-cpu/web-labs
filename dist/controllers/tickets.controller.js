"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketsController = void 0;
const tickets_service_1 = require("../services/tickets.service");
exports.ticketsController = {
    // 1. Отримання всіх квитків із фільтрацією
    async getAll(req, res, next) {
        try {
            const result = await tickets_service_1.ticketsService.getAll(req.query);
            // Повертаємо комбінований формат відповіді, який влаштує будь-який фронтенд
            res.json({ data: result.data, meta: result.meta });
        }
        catch (e) {
            next(e);
        }
    },
    // 2. Отримання статистики для лічильників на сайті
    async getStats(_req, res, next) {
        try {
            const stats = await tickets_service_1.ticketsService.getStats();
            res.json({ data: stats });
        }
        catch (e) {
            next(e);
        }
    },
    // 3. Пошук квитків за ключовими словами
    async search(req, res, next) {
        try {
            const q = String(req.query.q ?? "");
            const results = await tickets_service_1.ticketsService.search(q);
            res.json(Object.assign([...results], { data: results, meta: { count: results.length } }));
        }
        catch (e) {
            next(e);
        }
    },
    // 4. Отримання квитка за ID
    async getById(req, res, next) {
        try {
            const ticket = await tickets_service_1.ticketsService.getById(req.params.id);
            if (!ticket) {
                res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
                return;
            }
            res.json({ data: ticket });
        }
        catch (e) {
            next(e);
        }
    },
    // 5. Створення нового квитка через форму
    async create(req, res, next) {
        try {
            const created = await tickets_service_1.ticketsService.create(req.body);
            res.status(201).json(Object.assign({}, created, { data: created }));
        }
        catch (e) {
            next(e);
        }
    },
    // 6. Оновлення квитка (статус, пріоритет)
    async update(req, res, next) {
        try {
            const updated = await tickets_service_1.ticketsService.update(req.params.id, req.body);
            if (!updated) {
                res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
                return;
            }
            res.json({ data: updated });
        }
        catch (e) {
            next(e);
        }
    },
    // 7. Видалення квитка
    async delete(req, res, next) {
        try {
            const ok = await tickets_service_1.ticketsService.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
                return;
            }
            res.status(204).send();
        }
        catch (e) {
            next(e);
        }
    },
    // 8. Отримання повідомлень (коментарів) до квитка
    async getMessages(req, res, next) {
        try {
            const ticket = await tickets_service_1.ticketsService.getById(req.params.id);
            if (!ticket) {
                res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
                return;
            }
            const messages = await tickets_service_1.ticketsService.getMessages(req.params.id);
            res.json({ data: messages, meta: { count: messages.length } });
        }
        catch (e) {
            next(e);
        }
    },
    // 9. Додавання нового повідомлення у чат квитка
    async addMessage(req, res, next) {
        try {
            const ticket = await tickets_service_1.ticketsService.getById(req.params.id);
            if (!ticket) {
                res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
                return;
            }
            const created = await tickets_service_1.ticketsService.addMessage(req.params.id, req.body);
            res.status(201).json({ data: created });
        }
        catch (e) {
            next(e);
        }
    },
};
