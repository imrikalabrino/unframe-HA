import axios from 'axios';

export async function fetchRepositories(page = 1, limit = 10) {
    const response = await axios.get(`http://localhost:3000/repositories?limit=${limit}&page=${page}`, {
        withCredentials: true,
    });
    return response.data;
}
