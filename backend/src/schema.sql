-- Create Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    author VARCHAR,
    last_activity_at TIMESTAMPTZ,
    visibility VARCHAR
);

-- Create Commits Table
CREATE TABLE IF NOT EXISTS commits (
    id VARCHAR PRIMARY KEY,
    message TEXT NOT NULL,
    author VARCHAR,
    date TIMESTAMPTZ,
    repository_id VARCHAR REFERENCES repositories(id) ON DELETE CASCADE
);

-- Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    repository_id VARCHAR REFERENCES repositories(id) ON DELETE CASCADE
);
