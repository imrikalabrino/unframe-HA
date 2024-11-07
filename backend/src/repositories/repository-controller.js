const repositoryService = require('./repository-service');

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

exports.updateRepository = async (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    try {
        const updatedRepo = await repositoryService.updateRepository(id, fields);
        res.json(updatedRepo);
    } catch (error) {
        console.error(`Error in updateRepository controller:`, error);
        res.status(500).json({ error: 'Failed to update repository' });
    }
};

exports.deleteRepository = async (req, res) => {
    const { id } = req.params;

    try {
        await repositoryService.deleteRepository(id);
        res.json({ message: 'Repository and related data deleted successfully' });
    } catch (error) {
        console.error(`Error in deleteRepository controller:`, error);
        res.status(500).json({ error: 'Failed to delete repository' });
    }
};

exports.deleteCommit = async (req, res) => {
    const { id, commitId } = req.params;

    try {
        await repositoryService.deleteCommit(id, commitId);
        res.json({ message: 'Commit deleted successfully' });
    } catch (error) {
        console.error(`Error in deleteCommit controller:`, error);
        res.status(500).json({ error: 'Failed to delete commit' });
    }
};

exports.deleteBranch = async (req, res) => {
    const { id, branchId } = req.params;

    try {
        await repositoryService.deleteBranch(id, branchId);
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        console.error(`Error in deleteBranch controller:`, error);
        res.status(500).json({ error: 'Failed to delete branch' });
    }
};