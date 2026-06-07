"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, code, message, details = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
    static notFound(resource) {
        return new ApiError(404, "NOT_FOUND", `${resource} не знайдено`);
    }
    static validationError(details) {
        return new ApiError(400, "VALIDATION_ERROR", "Некоректні дані запиту", details);
    }
    static badRequest(message) {
        return new ApiError(400, "BAD_REQUEST", message);
    }
}
exports.ApiError = ApiError;
