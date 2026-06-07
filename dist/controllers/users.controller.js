"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_1 = require("../services/users.service");
exports.usersController = {
    async getAll(req, res, next) {
        try {
            const result = await users_service_1.usersService.getAll({
                role: req.query.role,
            });
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            const result = await users_service_1.usersService.getById(req.params.id);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            const result = await users_service_1.usersService.create(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            const result = await users_service_1.usersService.update(req.params.id, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            await users_service_1.usersService.delete(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    },
};
