import axios from 'axios';

export async function fetchRepositories(page = 1, limit = 10, searchQuery = '') {
    try {
        const response = await axios.get(`http://localhost:3000/repositories`, {
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
