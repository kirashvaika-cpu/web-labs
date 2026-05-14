import { Request, Response, NextFunction } from "express";
import { ticketsService } from "../services/tickets.service";
import { ticketMessagesService } from "../services/ticketMessages.service";

export const ticketsController = {
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ticketsService.getAll(req.query as Record<string, string>);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ticketsService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ticketsService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ticketsService.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      ticketsService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getMessages(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ticketMessagesService.getByTicketId(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  addMessage(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ticketMessagesService.create(req.params.id, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
};
