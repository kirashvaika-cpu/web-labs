"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketsRouter = void 0;
const express_1 = require("express");
const tickets_controller_1 = require("../controllers/tickets.controller");
exports.ticketsRouter = (0, express_1.Router)();
exports.ticketsRouter.get("/", tickets_controller_1.ticketsController.getAll);
exports.ticketsRouter.get("/:id", tickets_controller_1.ticketsController.getById);
exports.ticketsRouter.post("/", tickets_controller_1.ticketsController.create);
exports.ticketsRouter.put("/:id", tickets_controller_1.ticketsController.update);
exports.ticketsRouter.delete("/:id", tickets_controller_1.ticketsController.delete);
// Вкладені маршрути: повідомлення тікету
exports.ticketsRouter.get("/:id/messages", tickets_controller_1.ticketsController.getMessages);
exports.ticketsRouter.post("/:id/messages", tickets_controller_1.ticketsController.addMessage);
exports.default = express_1.Router;
