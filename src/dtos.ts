// ---- Users ----
export interface CreateUserDto {
  email: string;
  name: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: string;
}

export interface UserDto {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

// ---- Tickets ----
export interface CreateTicketDto {
  subject: string;
  message: string;
  priority: string;
  authorId: number;
}

export interface UpdateTicketDto {
  subject?: string;
  message?: string;
  status?: string;
  priority?: string;
}

export interface TicketDto {
  id: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketWithAuthorDto extends TicketDto {
  authorName: string;
  authorEmail: string;
}

// ---- TicketMessages ----
export interface CreateMessageDto {
  text: string;
  authorId: number;
}

export interface MessageDto {
  id: number;
  ticketId: number;
  authorId: number;
  text: string;
  createdAt: string;
}

export interface MessageWithAuthorDto extends MessageDto {
  authorName: string;
}

// ---- Common ----
export interface ListMeta {
  count: number;
  page?: number;
  pageSize?: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: ListMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: string;
}
