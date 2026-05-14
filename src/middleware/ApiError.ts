import { ErrorDetail } from "../dtos";

export class ApiError extends Error {
  status: number;
  code: string;
  details: ErrorDetail[] | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: ErrorDetail[] | null = null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static notFound(resource: string): ApiError {
    return new ApiError(404, "NOT_FOUND", `${resource} не знайдено`);
  }

  static validationError(details: ErrorDetail[]): ApiError {
    return new ApiError(400, "VALIDATION_ERROR", "Некоректні дані запиту", details);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, "BAD_REQUEST", message);
  }
}
