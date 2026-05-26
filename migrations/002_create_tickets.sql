CREATE TABLE IF NOT EXISTS Tickets (
  id          TEXT    PRIMARY KEY,
  subject     TEXT    NOT NULL,
  message     TEXT    NOT NULL,
  priority    TEXT    NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status      TEXT    NOT NULL DEFAULT 'Open'   CHECK (status   IN ('Open', 'InProgress', 'Resolved', 'Closed')),
  authorId    TEXT    NOT NULL,
  createdAt   TEXT    NOT NULL,
  updatedAt   TEXT    NOT NULL,
  FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE RESTRICT
);
