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
    const { id } = req.params;
    const { lastActivityAt } = req.query;
    const token = req.session.access_token;

    console.log(id, lastActivityAt, token)

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No access token available' });
    }

    try {
        const repository = await repositoryService.getRepositoryById(id, lastActivityAt, token);
        res.json(repository);
    } catch (error) {
        console.error('Error fetching repository by ID:', error);
        res.status(500).json({ error: 'Failed to fetch repository' });
    }
};
