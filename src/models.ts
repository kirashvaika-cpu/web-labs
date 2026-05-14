export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt: string;
}

export interface TicketEntity {
  id: string;
  subject: string;
  message: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "InProgress" | "Resolved" | "Closed";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessageEntity {
  id: string;
  ticketId: string;
  text: string;
  authorId: string;
  createdAt: string;
}
