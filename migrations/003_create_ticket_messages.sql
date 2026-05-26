CREATE TABLE IF NOT EXISTS TicketMessages (
  id        TEXT    PRIMARY KEY,
  ticketId  TEXT    NOT NULL,
  authorId  TEXT    NOT NULL,
  text      TEXT    NOT NULL,
  createdAt TEXT    NOT NULL,
  FOREIGN KEY (ticketId) REFERENCES Tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES Users(id)   ON DELETE RESTRICT
);
