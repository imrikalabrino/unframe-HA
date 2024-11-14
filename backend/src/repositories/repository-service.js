import axios from 'axios';
import { pool } from '../config/db.js';
import cacheUtil from '../utils/cache-util.js';

/**
 * Schema for validating repository fields before updating the database.
 */
const repositorySchema = {
  name: 'string',
  description: 'string',
  visibility: 'string',
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
async function getRepositories(token, limit = 10, page = 1, search = '') {
  try {
    const response = await axios.get('https://gitlab.com/api/v4/projects', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        visibility: 'public',
        per_page: limit,
        page,
        search,
        order_by: 'last_activity_at',
      },
    });

    return response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      author: repo.namespace ? repo.namespace.name : 'Unknown',
      last_activity_at: repo.last_activity_at,
      description: repo.description,
      avatar_url: repo.avatar_url,
    }));
  } catch (error) {
    error.message = 'Failed to fetch repositories';
    throw error;
  }
}

/**
 * Updates specific fields of a repository in the database after validating against the schema.
 *
 * @param {number} id - The ID of the repository to update.
 * @param {Object} fields - The fields and values to update.
 * @returns {Promise<Object>} - The updated repository object.
 * @throws {Error} - Throws an error if field validation or database update fails.
 */
async function updateRepository(id, fields) {
  try {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    keys.forEach((key, index) => {
      if (!(key in repositorySchema)) {
        throw new Error(`Invalid field: ${key}`);
      }
      if (typeof values[index] !== repositorySchema[key]) {
        throw new Error(
          `Invalid type for field ${key}: expected ${repositorySchema[key]}, got ${typeof values[index]}`
        );
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
    error.message = `Failed to update repository with ID ${id}`;
    throw error;
  }
}

/**
 * Deletes a repository from the database, along with its associated commits and branches.
 *
 * @param {number} id - The ID of the repository to delete.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the repository deletion fails.
 */
async function deleteRepository(id) {
  try {
    await pool.query('DELETE FROM repositories WHERE id = $1', [id]);
    cacheUtil.clear(id);
  } catch (error) {
    error.message = `Failed to delete repository with ID ${id}`;
    throw error;
  }
}

/**
 * Deletes a specific commit associated with a repository.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {number} commitId - The ID of the commit to delete.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the commit deletion fails.
 */
async function deleteCommit(repoId, commitId) {
  try {
    await pool.query('DELETE FROM commits WHERE id = $1 AND repository_id = $2', [commitId, repoId]);
    cacheUtil.clear(repoId);
  } catch (error) {
    error.message = `Failed to delete commit with ID ${commitId} for repository ${repoId}`;
    throw error;
  }
}

/**
 * Deletes a specific branch associated with a repository.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {number} branchId - The ID of the branch to delete.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the branch deletion fails.
 */
async function deleteBranch(repoId, branchId) {
  try {
    await pool.query('DELETE FROM branches WHERE id = $1 AND repository_id = $2', [branchId, repoId]);
    cacheUtil.clear(repoId);
  } catch (error) {
    error.message = `Failed to delete branch with ID ${branchId} for repository ${repoId}`;
    throw error;
  }
}

/**
 * Syncs commits and branches from GitLab with the local database for a specific repository.
 *
 * @param {number} repoId - The ID of the repository to sync.
 * @param {string} token - The GitLab access token.
 * @returns {Promise<void>}
 */
async function syncCommitsAndBranches(repoId, token) {
  try {
    const commitsResponse = await axios.get(
      `https://gitlab.com/api/v4/projects/${repoId}/repository/commits`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const commits = commitsResponse.data;
    for (const commit of commits) {
      await pool.query(
        `INSERT INTO commits (id, message, author, date, repository_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [commit.id, commit.message, commit.author_name, commit.created_at, repoId]
      );
    }

    const branchesResponse = await axios.get(
      `https://gitlab.com/api/v4/projects/${repoId}/repository/branches`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const branches = branchesResponse.data;
    for (const branch of branches) {
      await pool.query(
        `INSERT INTO branches (id, name, repository_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [branch.commit.id, branch.name, repoId]
      );
    }
  } catch (error) {
    error.message = `Failed to sync commits and branches for repository ${repoId}`;
    throw error;
  }
}

/**
 * Retrieves repository data by ID, pulling from cache or database, with minimal API calls to GitLab.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {string} lastActivityAt - The last activity date of the repository.
 * @param {string} token - The GitLab access token.
 * @returns {Promise<Object>} - The repository object including commits and branches.
 * @throws {Error} - Throws an error if fetching or syncing repository data fails.
 */
async function getRepositoryById(repoId, lastActivityAt, token) {
  try {
    // Try to get the repository from the cache
    let cachedRepo = cacheUtil.get(repoId);

    // Validate the cache based on the last activity date
    if (
      cachedRepo &&
      (!lastActivityAt || new Date(cachedRepo.last_activity_at) >= new Date(lastActivityAt))
    ) {
      return cachedRepo;
    }

    // Fetch from the database
    const result = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
    const dbRepo = result.rows[0];

    if (
      dbRepo &&
      (!lastActivityAt || new Date(dbRepo.last_activity_at) >= new Date(lastActivityAt))
    ) {
      const commits = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
      const branches = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

      cachedRepo = {
        ...dbRepo,
        commits: commits.rows,
        branches: branches.rows,
      };

      // Update the cache
      cacheUtil.set(repoId, cachedRepo);
      return cachedRepo;
    }

    // Fetch and update repository from GitLab API
    return await fetchAndUpdateRepo(repoId, token);
  } catch (error) {
    error.message = `Failed to fetch or sync repository with ID ${repoId}`;
    throw error;
  }
}

/**
 * Fetches repository data from GitLab, updates the local database, and caches the result.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {string} token - The GitLab access token.
 * @returns {Promise<Object>} - The repository object including commits and branches.
 */
async function fetchAndUpdateRepo(repoId, token) {
  try {
    const repoResponse = await axios.get(`https://gitlab.com/api/v4/projects/${repoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const repoData = repoResponse.data;

    await pool.query(
      `INSERT INTO repositories (
          id, name, description, author, last_activity_at, visibility,
          topics, default_branch, license_name, avatar_url, readme_url
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             author = EXCLUDED.author,
             last_activity_at = EXCLUDED.last_activity_at,
             visibility = EXCLUDED.visibility,
             topics = EXCLUDED.topics,
             default_branch = EXCLUDED.default_branch,
             license_name = EXCLUDED.license_name,
             avatar_url = EXCLUDED.avatar_url,
             readme_url = EXCLUDED.readme_url`,
      [
        repoData.id,
        repoData.name,
        repoData.description,
        repoData.namespace?.name || 'Unknown',
        repoData.last_activity_at,
        repoData.visibility,
        JSON.stringify(repoData.topics),
        repoData.default_branch,
        repoData.license?.name || 'N/A',
        repoData.avatar_url,
        repoData.readme_url,
      ]
    );

    await syncCommitsAndBranches(repoId, token);

    const updatedCommits = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [
      repoId,
    ]);
    const updatedBranches = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [
      repoId,
    ]);

    const updatedRepo = {
      id: repoData.id,
      name: repoData.name,
      description: repoData.description,
      author: repoData.namespace?.name || 'Unknown',
      last_activity_at: repoData.last_activity_at,
      visibility: repoData.visibility,
      topics: repoData.topics,
      default_branch: repoData.default_branch,
      license_name: repoData.license?.name || 'N/A',
      avatar_url: repoData.avatar_url,
      readme_url: repoData.readme_url,
      commits: updatedCommits.rows,
      branches: updatedBranches.rows,
    };

    // Update the cache
    cacheUtil.set(repoId, updatedRepo);
    return updatedRepo;
  } catch (error) {
    error.message = `Failed to fetch and update repository with ID ${repoId}`;
    throw error;
  }
}

export default {
  getRepositories,
  updateRepository,
  deleteRepository,
  deleteCommit,
  deleteBranch,
  getRepositoryById,
};
