const axios = require('axios');
const { pool } = require('../config/db');
const cacheUtil = require('../utils/cache-util');

/**
 * Schema for validating repository fields before updating the database.
 */
const repositorySchema = {
    name: 'string',
    description: 'string',
    visibility: 'string'
};

/**
 * Fetches a list of repositories from GitLab, applying pagination, visibility, and search filters.
 *
 * @param {string} token - The GitLab access token.
 * @param {number} [limit=10] - Number of repositories to fetch per page.
 * @param {number} [page=1] - The page number to fetch.
 * @param {string} [search=''] - Search query for filtering repositories.
 * @returns {Promise<Array<Object>>} - A list of repository objects.
 * @throws {Error} - Throws an error if the GitLab API request fails.
 */
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
            avatar_url: repo.avatar_url
        }));
    } catch (error) {
        console.error('Error fetching repositories from GitLab:', error);
        throw new Error('Failed to fetch repositories');
    }
};

/**
 * Updates specific fields of a repository in the database after validating against the schema.
 *
 * @param {number} id - The ID of the repository to update.
 * @param {Object} fields - The fields and values to update.
 * @returns {Promise<Object>} - The updated repository object.
 * @throws {Error} - Throws an error if field validation or database update fails.
 */
exports.updateRepository = async (id, fields) => {
    try {
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        keys.forEach((key, index) => {
            if (!(key in repositorySchema)) {
                throw new Error(`Invalid field: ${key}`);
            }
            if (typeof values[index] !== repositorySchema[key]) {
                throw new Error(`Invalid type for field ${key}: expected ${repositorySchema[key]}, got ${typeof values[index]}`);
            }
        });

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        values.push(id);

        const query = `
            UPDATE repositories
            SET ${setClause}
            WHERE id = $${values.length}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        cacheUtil.clear(id);
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating repository with ID ${id}:`, error);
        throw new Error('Failed to update repository');
    }
};

/**
 * Deletes a repository from the database, along with its associated commits and branches.
 *
 * @param {number} id - The ID of the repository to delete.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the repository deletion fails.
 */
exports.deleteRepository = async (id) => {
    try {
        await pool.query('DELETE FROM repositories WHERE id = $1', [id]);
        cacheUtil.clear(id);
    } catch (error) {
        console.error(`Error deleting repository with ID ${id}:`, error);
        throw new Error('Failed to delete repository');
    }
};

/**
 * Deletes a specific commit associated with a repository.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {number} commitId - The ID of the commit to delete.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the commit deletion fails.
 */
exports.deleteCommit = async (repoId, commitId) => {
    try {
        await pool.query('DELETE FROM commits WHERE id = $1 AND repository_id = $2', [commitId, repoId]);
        cacheUtil.clear(repoId);
    } catch (error) {
        console.error(`Error deleting commit with ID ${commitId} for repository ${repoId}:`, error);
        throw new Error('Failed to delete commit');
    }
};

/**
 * Deletes a specific branch associated with a repository.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {number} branchId - The ID of the branch to delete.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the branch deletion fails.
 */
exports.deleteBranch = async (repoId, branchId) => {
    try {
        await pool.query('DELETE FROM branches WHERE id = $1 AND repository_id = $2', [branchId, repoId]);
        cacheUtil.clear(repoId);
    } catch (error) {
        console.error(`Error deleting branch with ID ${branchId} for repository ${repoId}:`, error);
        throw new Error('Failed to delete branch');
    }
};

/**
 * Syncs commits and branches from GitLab with the local database for a specific repository.
 *
 * @param {number} repoId - The ID of the repository to sync.
 * @param {string} token - The GitLab access token.
 * @returns {Promise<void>}
 */
const syncCommitsAndBranches = async (repoId, token) => {
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

/**
 * Retrieves repository data by ID, pulling from cache or database, with minimal API calls to GitLab.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {string} lastActivityAt - The last activity date of the repository.
 * @param {string} token - The GitLab access token.
 * @returns {Promise<Object>} - The repository object including commits and branches.
 * @throws {Error} - Throws an error if fetching or syncing repository data fails.
 */
exports.getRepositoryById = async (repoId, lastActivityAt, token) => {
    try {
        // We first try the caching mechanism for the sought repository
        let cachedRepo = cacheUtil.get(repoId);

        // If its found, it can be returned. Unless a last activity date is provided, in that case it validates
        // the date to determine if a request to the db or api is needed.
        if (cachedRepo && (!lastActivityAt || new Date(cachedRepo.last_activity_at) >= new Date(lastActivityAt))) {
            return cachedRepo;
        }

        // If the cached version is not viable, pull from the db
        const result = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
        const dbRepo = result.rows[0];

        // The same date validation occurs on the data from the db, if its present
        if (dbRepo && (!lastActivityAt || new Date(dbRepo.last_activity_at) >= new Date(lastActivityAt))) {
            const commits = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
            const branches = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

            cachedRepo = {
                ...dbRepo,
                commits: commits.rows,
                branches: branches.rows
            };

            // Update the cache
            cacheUtil.set(repoId, cachedRepo);
            return cachedRepo;
        }

        // If the repo is not found in the caching system or the db or they are both invalidated (old data
        // compared to the api) we get the repo from gitlabs api and update the db and cache.
        return await fetchAndUpdateRepo(repoId, token);

    } catch (error) {
        console.error(`Error fetching or syncing repository with ID ${repoId}:`, error);
        throw new Error('Failed to fetch or sync repository');
    }
};

/**
 * Fetches repository data from GitLab, updates the local database, and caches the result.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {string} token - The GitLab access token.
 * @returns {Promise<Object>} - The repository object including commits and branches.
 */
const fetchAndUpdateRepo = async (repoId, token) => {
    const repoResponse = await axios.get(`https://gitlab.com/api/v4/projects/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const repoData = repoResponse.data;

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

    await syncCommitsAndBranches(repoId, token);

    const updatedCommits = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
    const updatedBranches = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

    const updatedRepo = {
        id: repoData.id,
        name: repoData.name,
        description: repoData.description,
        author: repoData.namespace?.name || 'Unknown',
        last_activity_at: repoData.last_activity_at,
        visibility: repoData.visibility,
        commits: updatedCommits.rows,
        branches: updatedBranches.rows
    };

    cacheUtil.set(repoId, updatedRepo);
    return updatedRepo;
};
