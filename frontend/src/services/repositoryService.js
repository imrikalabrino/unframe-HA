import axios from 'axios';

const BASE_URL = 'http://localhost:3000/repositories';

// Fetch all repositories
export async function fetchRepositories(page = 1, limit = 10, searchQuery = '') {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                limit,
                page,
                search: searchQuery,
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching repositories:", error);
        throw error;
    }
}

// Fetch a single repository by ID
export async function fetchRepositoryById(id, lastActivityAt) {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, {
            params: { lastActivityAt },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching repository with ID ${id}:`, error);
        throw error;
    }
}

// Update a repository's details (name, description, visibility)
export async function updateRepository(id, updatedFields) {
    try {
        console.log("UPDATE: ", id, updatedFields, `${BASE_URL}/${id}`);
        const response = await axios.patch(`${BASE_URL}/${id}`, updatedFields, {
            withCredentials: true,
        });
        console.log("UPDATE res: ", response);
        return response.data;
    } catch (error) {
        console.error(`Error updating repository with ID ${id}:`, error);
        throw error;
    }
}

// Delete a repository and its associated commits and branches
export async function deleteRepository(id) {
    try {
        console.log("DELETE REPO: ", id);
        await axios.delete(`${BASE_URL}/${id}`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error(`Error deleting repository with ID ${id}:`, error);
        throw error;
    }
}

// Delete a specific commit within a repository
export async function deleteCommit(repoId, commitId) {
    try {
        console.log("DELETE COMM: ", repoId, commitId);
        await axios.delete(`${BASE_URL}/${repoId}/commits/${commitId}`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error(`Error deleting commit with ID ${commitId} for repository ${repoId}:`, error);
        throw error;
    }
}

// Delete a specific branch within a repository
export async function deleteBranch(repoId, branchId) {
    try {
        console.log("DELETE BRANCH: ", repoId, branchId);
        await axios.delete(`${BASE_URL}/${repoId}/branches/${branchId}`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error(`Error deleting branch with ID ${branchId} for repository ${repoId}:`, error);
        throw error;
    }
}
