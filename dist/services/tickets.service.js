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
exports.ticketsService = void 0;
const ticketsRepo = __importStar(require("../repositories/tickets.repository"));
const usersRepo = __importStar(require("../repositories/users.repository"));
const messagesRepo = __importStar(require("../repositories/ticketMessages.repository"));
// Допоміжний метод для уникнення дублювання коду
async function resolveAuthorId(authorId) {
    // Якщо це вже UUID — повертаємо як є
    if (authorId.includes("-")) {
        return authorId;
    }
    // Якщо число — шукаємо за id
    if (!isNaN(Number(authorId))) {
        return authorId;
    }
    // Якщо ім'я — шукаємо за іменем
    const allUsers = await usersRepo.findAll();
    const user = allUsers.find((u) => u.name === authorId);
    return user ? String(user.id) : authorId;
}
exports.ticketsService = {
    // 1. Отримання всіх квитків із підставленням імен авторів для фронтенду
    async getAll(filters) {
        const rawTickets = await ticketsRepo.findAll({
            status: filters.status,
            priority: filters.priority,
            authorId: filters.authorId,
            sortBy: filters.sortBy,
            sortDir: filters.sortDir,
            page: filters.page ? Number(filters.page) : undefined,
            pageSize: filters.pageSize ? Number(filters.pageSize) : undefined,
        });
        const allUsers = await usersRepo.findAll();
        const tickets = rawTickets.map((t) => {
            const user = allUsers.find((u) => String(u.id) === String(t.authorId));
            const authorName = user ? user.name : "Вікторія Тихомирова";
            let displayPriority = t.priority;
            if (t.priority === "Low")
                displayPriority = "Низький";
            if (t.priority === "Medium")
                displayPriority = "Середній";
            if (t.priority === "High")
                displayPriority = "Високий";
            let displayStatus = t.status;
            if (t.status === "Open")
                displayStatus = "Відкрито";
            return {
                ...t,
                subject: t.subject || t.title,
                message: t.message || t.description,
                priority: displayPriority,
                status: displayStatus,
                authorId: t.authorId,
                author: { id: t.authorId, name: authorName },
                authorName,
                user: { name: authorName },
            };
        });
        return { data: tickets, meta: { count: tickets.length } };
    },
    // Повертаємо чіткий системний тип TicketStats
    async getStats() {
        return await ticketsRepo.getStats();
    },
    async search(q) {
        return (await ticketsRepo.search(q));
    },
    // Приведення типів через обгортку усуває помилку TS2322 з null/undefined
    async getById(id) {
        const ticket = await ticketsRepo.findById(id);
        if (!ticket)
            return undefined;
        return ticket;
    },
    // Оновлено: типізовано через TicketPriority та усунуто дублювання коду
    async create(dto) {
        let priorityStr = String(dto.priority ?? "Low");
        if (priorityStr === "Низький")
            priorityStr = "Low";
        if (priorityStr === "Середній")
            priorityStr = "Medium";
        if (priorityStr === "Високий")
            priorityStr = "High";
        const priority = priorityStr;
        const authorId = await resolveAuthorId(String(dto.authorId ?? "1"));
        return (await ticketsRepo.create({
            subject: String(dto.subject),
            message: String(dto.message),
            priority,
            authorId,
        }));
    },
    async update(id, dto) {
        const updated = await ticketsRepo.update(id, dto);
        if (!updated)
            return undefined;
        return updated;
    },
    async delete(id) {
        return await ticketsRepo.remove(id);
    },
    async getMessages(ticketId) {
        return await messagesRepo.findByTicket(ticketId);
    },
    async addMessage(ticketId, dto) {
        const authorId = await resolveAuthorId(dto.authorId ?? "1");
        return await messagesRepo.create(ticketId, {
            text: dto.text,
            authorId,
        });
    },
};
