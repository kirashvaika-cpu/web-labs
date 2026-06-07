"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireString = requireString;
exports.requireEnum = requireEnum;
exports.requireEmail = requireEmail;
exports.collectErrors = collectErrors;
function requireString(value, field, minLen = 1, maxLen = 500) {
    if (typeof value !== "string" || value.trim().length < minLen) {
        return { field, message: `${field} є обов'язковим рядком (мін. ${minLen} символів)` };
    }
    if (value.trim().length > maxLen) {
        return { field, message: `${field} не може бути довшим за ${maxLen} символів` };
    }
    return null;
}
function requireEnum(value, field, allowed) {
    if (!allowed.includes(value)) {
        return { field, message: `${field} має бути одним з: ${allowed.join(", ")}` };
    }
    return null;
}
function requireEmail(value, field) {
    if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { field, message: `${field} має бути коректною email адресою` };
    }
    return null;
}
function collectErrors(checks) {
    return checks.filter((e) => e !== null);
}
