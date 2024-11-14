-- Create Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR PRIMARY KEY,                 -- GitLab repository ID
    name VARCHAR NOT NULL,                  -- Repository name
    description TEXT,                       -- Repository description
    author VARCHAR,                         -- Repository owner or namespace
    last_activity_at TIMESTAMPTZ,           -- Last activity timestamp for updates
    visibility VARCHAR,                     -- Visibility (public, private)
    created_at TIMESTAMPTZ DEFAULT NOW(),   -- Timestamp for record creation
    updated_at TIMESTAMPTZ DEFAULT NOW(),   -- Timestamp for record updates
    topics JSONB,                           -- Topics related to the repository
    default_branch VARCHAR,                 -- Default branch of the repository
    license_name VARCHAR,                   -- License name for the repository
    avatar_url VARCHAR,                     -- Avatar URL for the repository
    readme_url VARCHAR                      -- URL to the README file
);



-- Create Commits Table
CREATE TABLE IF NOT EXISTS commits (
    id VARCHAR PRIMARY KEY,            -- Unique commit ID from GitLab
    message TEXT NOT NULL,             -- Commit message
    author VARCHAR,                    -- Commit author name or email
    date TIMESTAMPTZ,                  -- Date of the commit
    repository_id VARCHAR REFERENCES repositories(id) ON DELETE CASCADE, -- Link to repository
    created_at TIMESTAMPTZ DEFAULT NOW()  -- Timestamp for record creation
);


-- Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR PRIMARY KEY,              -- Unique identifier for branch, can be GitLab's branch ID
    name VARCHAR NOT NULL,               -- Branch name
    repository_id VARCHAR REFERENCES repositories(id) ON DELETE CASCADE, -- Link to repository
    created_at TIMESTAMPTZ DEFAULT NOW()  -- Timestamp for record creation
);


-- Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
     id SERIAL PRIMARY KEY,
     repository_id VARCHAR REFERENCES repositories(id) ON DELETE CASCADE,
     message TEXT NOT NULL,            -- Conversation message
     role VARCHAR NOT NULL,            -- 'user' or 'assistant'
     created_at TIMESTAMPTZ DEFAULT NOW()  -- Timestamp for when the message was added
);


-- Create Users Table
CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       image_url VARCHAR(255)
);
