const axios = require('axios');
const { pool } = require('../config/db');

const repositorySchema = {
    name: 'string',
    description: 'string',
    visibility: 'string'
};

exports.getRepositories = async (token, limit = 10, page = 1, search = '') => {
    try {
        const response = await axios.get('https://gitlab.com/api/v4/projects', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                visibility: 'public',
                per_page: limit,
                page: page,
                search: search,
                order_by: 'last_activity_at'
            },
        });

        return response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            author: repo.namespace ? repo.namespace.name : 'Unknown',
            last_activity_at: repo.last_activity_at,
            description: repo.description,
        }));
    } catch (error) {
        console.error('Error fetching repositories from GitLab:', error);
        throw new Error('Failed to fetch repositories');
    }
};

exports.updateRepository = async (id, fields) => {
    try {
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        // Validate fields against the schema
        keys.forEach((key, index) => {
            if (!(key in repositorySchema)) {
                throw new Error(`Invalid field: ${key}`);
            }
            if (typeof values[index] !== repositorySchema[key]) {
                throw new Error(`Invalid type for field ${key}: expected ${repositorySchema[key]}, got ${typeof values[index]}`);
            }
        });

        // Construct SQL query
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        values.push(id);

        const query = `
            UPDATE repositories
            SET ${setClause}
            WHERE id = $${values.length}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating repository with ID ${id}:`, error);
        throw new Error('Failed to update repository');
    }
};

// Delete repository with its commits and branches
exports.deleteRepository = async (id) => {
    try {
        await pool.query('DELETE FROM repositories WHERE id = $1', [id]);
    } catch (error) {
        console.error(`Error deleting repository with ID ${id}:`, error);
        throw new Error('Failed to delete repository');
    }
};

// Delete specific commit
exports.deleteCommit = async (repoId, commitId) => {
    try {
        await pool.query('DELETE FROM commits WHERE id = $1 AND repository_id = $2', [commitId, repoId]);
    } catch (error) {
        console.error(`Error deleting commit with ID ${commitId} for repository ${repoId}:`, error);
        throw new Error('Failed to delete commit');
    }
};

// Delete specific branch
exports.deleteBranch = async (repoId, branchId) => {
    try {
        await pool.query('DELETE FROM branches WHERE id = $1 AND repository_id = $2', [branchId, repoId]);
    } catch (error) {
        console.error(`Error deleting branch with ID ${branchId} for repository ${repoId}:`, error);
        throw new Error('Failed to delete branch');
    }
};

// Helper function to sync commits and branches
const syncCommitsAndBranches = async (repoId, token) => {
    // Sync commits
    const commitsResponse = await axios.get(`https://gitlab.com/api/v4/projects/${repoId}/repository/commits`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const commits = commitsResponse.data;

    for (const commit of commits) {
        await pool.query(
            `INSERT INTO commits (id, message, author, date, repository_id)
             VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO NOTHING`,
            [commit.id, commit.message, commit.author_name, commit.created_at, repoId]
        );
    }

    // Sync branches
    const branchesResponse = await axios.get(`https://gitlab.com/api/v4/projects/${repoId}/repository/branches`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const branches = branchesResponse.data;

    for (const branch of branches) {
        await pool.query(
            `INSERT INTO branches (id, name, repository_id)
             VALUES ($1, $2, $3)
                 ON CONFLICT (id) DO NOTHING`,
            [branch.commit.id, branch.name, repoId]
        );
    }
};

// Main function to get repository by ID with minimal GitLab API calls
exports.getRepositoryById = async (repoId, lastActivityAt, token) => {
    try {
        // Check if the repository exists in the database
        const result = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
        const dbRepo = result.rows[0];

        if (dbRepo) {
            // Compare `last_activity_at` timestamps
            if (new Date(dbRepo.last_activity_at) >= new Date(lastActivityAt)) {
                // Database version is up-to-date, return it with commits and branches
                const commits = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
                const branches = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);
                return {
                    ...dbRepo,
                    commits: commits.rows,
                    branches: branches.rows
                };
            } else {
                // GitLab version is newer, fetch it and update the database
                return await fetchAndUpdateRepo(repoId, token);
            }
        } else {
            // Repository does not exist in the database, fetch from GitLab, store, and return it
            return await fetchAndUpdateRepo(repoId, token);
        }
    } catch (error) {
        console.error(`Error fetching or syncing repository with ID ${repoId}:`, error);
        throw new Error('Failed to fetch or sync repository');
    }
};

// Helper function to fetch repository from GitLab, sync it with the DB, and return it
const fetchAndUpdateRepo = async (repoId, token) => {
    // Fetch repository data from GitLab
    const repoResponse = await axios.get(`https://gitlab.com/api/v4/projects/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const repoData = repoResponse.data;

    // Upsert repository data in the DB
    await pool.query(
        `INSERT INTO repositories (id, name, description, author, last_activity_at, visibility)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             author = EXCLUDED.author,
             last_activity_at = EXCLUDED.last_activity_at,
             visibility = EXCLUDED.visibility`,
        [
            repoData.id,
            repoData.name,
            repoData.description,
            repoData.namespace?.name || 'Unknown',
            repoData.last_activity_at,
            repoData.visibility
        ]
    );

    // Sync commits and branches
    await syncCommitsAndBranches(repoId, token);

    // Return the repository data along with commits and branches from the database
    const updatedCommits = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
    const updatedBranches = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

    return {
        id: repoData.id,
        name: repoData.name,
        description: repoData.description,
        author: repoData.namespace?.name || 'Unknown',
        last_activity_at: repoData.last_activity_at,
        visibility: repoData.visibility,
        commits: updatedCommits.rows,
        branches: updatedBranches.rows
    };
};