CREATE TABLE IF NOT EXISTS Tickets (
  id INTEGER PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'InProgress', 'Resolved', 'Closed')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  authorId INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE RESTRICT
);
