const repositoryService = require('../services/repositoryService');

exports.getAllRepositories = async (req, res) => {
    const token = req.session.access_token;

    if (!token) {
        return res.status(401).send('Unauthorized: No access token available');
    }

    try {
        const { limit, page, search } = req.query;
        const repositories = await repositoryService.getRepositories(token, limit, page, search);
        res.status(200).json(repositories);
    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).json({ error: 'Failed to load repositories' });
    }
};

exports.getRepositoryById = async (req, res) => {
    const token = req.session.access_token;

    if (!token) {
        return res.status(401).send('Unauthorized: No access token available');
    }

    try {
        const { id } = req.params;
        const repository = await repositoryService.getRepositoryById(id);
        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }
        res.status(200).json(repository);
    } catch (error) {
        console.error(`Error fetching repository ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to load repository' });
    }
};
