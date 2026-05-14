import { Router } from "express";
import { ticketsController } from "../controllers/tickets.controller";

export const ticketsRouter = Router();

ticketsRouter.get("/", ticketsController.getAll);
ticketsRouter.get("/:id", ticketsController.getById);
ticketsRouter.post("/", ticketsController.create);
ticketsRouter.put("/:id", ticketsController.update);
ticketsRouter.delete("/:id", ticketsController.delete);

// Вкладені маршрути: повідомлення тікету
ticketsRouter.get("/:id/messages", ticketsController.getMessages);
ticketsRouter.post("/:id/messages", ticketsController.addMessage);
