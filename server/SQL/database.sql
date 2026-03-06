CREATE TABLE Projects (
  id   CHAR(36) PRIMARY KEY,
  name TEXT     NOT NULL,
  description TEXT     NOT NULL,
  skills TEXT     NOT NULL,
  time DATETIME
);

INSERT INTO Projects (id, name, description, skills, time) VALUES
( 
  'Project One',
  'these are three default messages',
  'This is the first project.',
  'HTML, CSS',
  datetime('now')),
(
  'delivered from the server',
  'This is the second project.',
  'JavaScript, Node.js',
  datetime('now')),
(
  'using a custom route',
  'This is the third project.',
  'React, TypeScript',
  datetime('now'));


-- Down

-- DROP TABLE Projects;