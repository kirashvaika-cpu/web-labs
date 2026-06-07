"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketMessagesService = void 0;
const ticketMessagesRepoModule = __importStar(require("../repositories/ticketMessagesRepo"));
const ticketsRepoModule = __importStar(require("../repositories/ticketsRepo"));
const usersRepoModule = __importStar(require("../repositories/usersRepo"));
const ApiError_1 = require("../middleware/ApiError");
const validation_1 = require("../middleware/validation");
const ticketMessagesRepo = ticketMessagesRepoModule;
const ticketsRepo = ticketsRepoModule;
const usersRepo = usersRepoModule;
function toDto(e) {
    return {
        id: Number(e.id),
        ticketId: Number(e.ticketId),
        text: e.text,
        authorId: Number(e.authorId),
        createdAt: new Date(e.createdAt),
    };
}
exports.ticketMessagesService = {
    getByTicketId(ticketId) {
        if (!ticketsRepo.getById(ticketId))
            throw ApiError_1.ApiError.notFound("Тікет");
        const items = ticketMessagesRepo.getByTicketId(ticketId);
        return {
            data: items.map(toDto),
            meta: { count: items.length },
        };
    },
    create(ticketId, dto) {
        if (!ticketsRepo.getById(ticketId))
            throw ApiError_1.ApiError.notFound("Тікет");
        const errors = (0, validation_1.collectErrors)([
            (0, validation_1.requireString)(dto.text, "text", 1, 2000),
            (0, validation_1.requireString)(String(dto.authorId), "authorId", 1),
        ]);
        if (errors.length > 0)
            throw ApiError_1.ApiError.validationError(errors);
        if (!usersRepo.getById(dto.authorId)) {
            throw ApiError_1.ApiError.badRequest("Автор (authorId) не знайдений");
        }
        const entity = ticketMessagesRepo.add({
            ticketId: Number(ticketId),
            text: dto.text.trim(),
            authorId: Number(dto.authorId),
        });
        return toDto(entity);
    },
};
