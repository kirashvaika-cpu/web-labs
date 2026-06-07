import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";

export const usersController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getAll({
        role: req.query.role as string | undefined,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getById(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
