interface ErrorDetail {
  field: string;
  message: string;
}

export function requireString(
  value: unknown,
  field: string,
  minLen = 1,
  maxLen = 500
): ErrorDetail | null {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return { field, message: `${field} є обов'язковим рядком (мін. ${minLen} символів)` };
  }
  if (value.trim().length > maxLen) {
    return { field, message: `${field} не може бути довшим за ${maxLen} символів` };
  }
  return null;
}

export function requireEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: T[]
): ErrorDetail | null {
  if (!allowed.includes(value as T)) {
    return { field, message: `${field} має бути одним з: ${allowed.join(", ")}` };
  }
  return null;
}

export function requireEmail(value: unknown, field: string): ErrorDetail | null {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { field, message: `${field} має бути коректною email адресою` };
  }
  return null;
}

export function collectErrors(checks: Array<ErrorDetail | null>): ErrorDetail[] {
  return checks.filter((e): e is ErrorDetail => e !== null);
}
