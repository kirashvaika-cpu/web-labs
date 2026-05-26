CREATE TABLE IF NOT EXISTS Users (
  id        TEXT    PRIMARY KEY,
  name      TEXT    NOT NULL,
  email     TEXT    NOT NULL UNIQUE,
  role      TEXT    NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'support')),
  createdAt TEXT    NOT NULL
);
