import axios from 'axios';
import router from '../router';

const BASE_URL = 'http://localhost:3000/repositories';

/**
 * Helper function to handle unauthorized errors by checking token validity.
 * If the token is invalid, redirects the user to the login page.
 * @param {Error} error - The error object received from an Axios request.
 */
async function handleUnauthorized(error) {
    if (error.response && error.response.status === 401) {
        try {
            const tokenResponse = await axios.get('http://localhost:3000/auth/check-token', { withCredentials: true });
            if (!tokenResponse.data.valid) {
                await router.push('/login'); // Redirect if token is invalid
            }
        } catch (tokenError) {
            console.error("Error checking token validity:", tokenError);
            await router.push('/login'); // Redirect if token check fails
        }
    } else {
        throw error; // Rethrow if error is not unauthorized
    }
}

/**
 * Fetches a paginated list of repositories based on provided parameters.
 * @param {number} page - Current page number.
 * @param {number} limit - Number of items per page.
 * @param {string} searchQuery - Search query for filtering repositories.
 * @returns {Promise<Object>} - The data containing repositories list.
 */
export async function fetchRepositories(page = 1, limit = 10, searchQuery = '') {
    try {
        const response = await axios.get(BASE_URL, {
            params: { limit, page, search: searchQuery },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching repositories:", error);
        await handleUnauthorized(error); // Handle unauthorized errors
    }
}

/**
 * Fetches a specific repository by its ID.
 * @param {number} id - The ID of the repository to fetch.
 * @param {string} lastActivityAt - Optional parameter to check the last activity date.
 * @returns {Promise<Object>} - The data containing the repository details.
 */
export async function fetchRepositoryById(id, lastActivityAt) {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, {
            params: { lastActivityAt },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching repository with ID ${id}:`, error);
        await handleUnauthorized(error);
    }
}

/**
 * Updates repository details (name, description, visibility) by ID.
 * @param {number} id - The ID of the repository to update.
 * @param {Object} updatedFields - Object containing the updated fields.
 * @returns {Promise<Object>} - The data containing updated repository information.
 */
export async function updateRepository(id, updatedFields) {
    try {
        const response = await axios.patch(`${BASE_URL}/${id}`, updatedFields, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating repository with ID ${id}:`, error);
        await handleUnauthorized(error);
    }
}

/**
 * Deletes a repository by ID, along with its commits and branches.
 * @param {number} id - The ID of the repository to delete.
 */
export async function deleteRepository(id) {
    try {
        await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
    } catch (error) {
        console.error(`Error deleting repository with ID ${id}:`, error);
        await handleUnauthorized(error);
    }
}

/**
 * Deletes a specific commit within a repository.
 * @param {number} repoId - The ID of the repository.
 * @param {number} commitId - The ID of the commit to delete.
 */
export async function deleteCommit(repoId, commitId) {
    try {
        await axios.delete(`${BASE_URL}/${repoId}/commits/${commitId}`, { withCredentials: true });
    } catch (error) {
        console.error(`Error deleting commit with ID ${commitId} for repository ${repoId}:`, error);
        await handleUnauthorized(error);
    }
}

/**
 * Deletes a specific branch within a repository.
 * @param {number} repoId - The ID of the repository.
 * @param {number} branchId - The ID of the branch to delete.
 */
export async function deleteBranch(repoId, branchId) {
    try {
        await axios.delete(`${BASE_URL}/${repoId}/branches/${branchId}`, { withCredentials: true });
    } catch (error) {
        console.error(`Error deleting branch with ID ${branchId} for repository ${repoId}:`, error);
        await handleUnauthorized(error);
    }
}
