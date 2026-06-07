import { Request, Response, NextFunction } from "express";
import { ticketsService } from "../services/tickets.service";

export const ticketsController = {
  // 1. Отримання всіх квитків із фільтрацією
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ticketsService.getAll(req.query);

      // Повертаємо комбінований формат відповіді, який влаштує будь-який фронтенд
      res.json({ data: result.data, meta: result.meta });
    } catch (e) {
      next(e);
    }
  },

  // 2. Отримання статистики для лічильників на сайті
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ticketsService.getStats();
      res.json({ data: stats });
    } catch (e) {
      next(e);
    }
  },

  // 3. Пошук квитків за ключовими словами
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = String(req.query.q ?? "");
      const results = await ticketsService.search(q);
      res.json(Object.assign([...results], { data: results, meta: { count: results.length } }));
    } catch (e) {
      next(e);
    }
  },

  // 4. Отримання квитка за ID
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketsService.getById(req.params.id);
      if (!ticket) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
        return;
      }
      res.json({ data: ticket });
    } catch (e) {
      next(e);
    }
  },

  // 5. Створення нового квитка через форму
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await ticketsService.create(req.body);
      res.status(201).json(Object.assign({}, created, { data: created }));
    } catch (e) {
      next(e);
    }
  },

  // 6. Оновлення квитка (статус, пріоритет)
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await ticketsService.update(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
        return;
      }
      res.json({ data: updated });
    } catch (e) {
      next(e);
    }
  },

  // 7. Видалення квитка
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ok = await ticketsService.delete(req.params.id);
      if (!ok) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
        return;
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },

  // 8. Отримання повідомлень (коментарів) до квитка
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketsService.getById(req.params.id);
      if (!ticket) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
        return;
      }
      const messages = await ticketsService.getMessages(req.params.id);
      res.json({ data: messages, meta: { count: messages.length } });
    } catch (e) {
      next(e);
    }
  },

  // 9. Додавання нового повідомлення у чат квитка
  async addMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketsService.getById(req.params.id);
      if (!ticket) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
        return;
      }
      const created = await ticketsService.addMessage(req.params.id, req.body);
      res.status(201).json({ data: created });
    } catch (e) {
      next(e);
    }
  },
};
