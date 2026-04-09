CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    time VARCHAR(50),
    description TEXT
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER REFERENCES users(id),
    UNIQUE(event_id, user_id)
);

INSERT INTO events (title, date, time, description) VALUES
('AI & ML Workshop', '2026-12-10 10:00:00', '10:00 AM - 1:00 PM', 'Learn AI basics'),
('Git & GitHub Mastery', '2026-12-18 14:00:00', '2:00 PM - 5:00 PM', 'Master SVC systems')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    UNIQUE(project_id, user_id)
);

SELECT setval('skills_id_seq', COALESCE((SELECT MAX(id) FROM skills), 1));
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
