// ========================
// USER DTOs
// ========================

export interface CreateUserRequestDto {
  name: string;
  email: string;
  role: "student" | "admin";
}

export interface UpdateUserRequestDto {
  name?: string;
  email?: string;
  role?: "student" | "admin";
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt: string;
}

// ========================
// TICKET DTOs
// ========================

export interface CreateTicketRequestDto {
  subject: string;
  message: string;
  priority: "Low" | "Medium" | "High";
  authorId: string;
}

export interface UpdateTicketRequestDto {
  subject?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "Open" | "InProgress" | "Resolved" | "Closed";
}

export interface TicketResponseDto {
  id: string;
  subject: string;
  message: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "InProgress" | "Resolved" | "Closed";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// TICKET MESSAGE DTOs
// ========================

export interface CreateTicketMessageRequestDto {
  text: string;
  authorId: string;
}

export interface TicketMessageResponseDto {
  id: string;
  ticketId: string;
  text: string;
  authorId: string;
  createdAt: string;
}

// ========================
// LIST RESPONSE
// ========================

export interface ListResponseDto<T> {
  items: T[];
  total: number;
}

// ========================
// ERROR RESPONSE
// ========================

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}
