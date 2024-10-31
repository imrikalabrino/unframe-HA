const axios = require('axios');
const db = require('../config/db');

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

exports.getRepositoryById = async (id) => {
    try {
        const result = await db.query('SELECT * FROM repositories WHERE id = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error fetching repository with ID ${id}:`, error);
        throw new Error('Failed to fetch repository by ID');
    }
};

exports.syncRepositoryData = async (repoId, data) => {
    try {
        await db.query(
            'UPDATE repositories SET name = $1, description = $2, last_activity_at = $3 WHERE id = $4',
            [data.name, data.description, data.last_activity_at, repoId]
        );
    } catch (error) {
        console.error(`Error syncing repository data for ID ${repoId}:`, error);
        throw new Error('Failed to sync repository data');
    }
};
