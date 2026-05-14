import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";

export const usersController = {
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = usersService.getAll({ role: req.query.role as string | undefined });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = usersService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = usersService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = usersService.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      usersService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
