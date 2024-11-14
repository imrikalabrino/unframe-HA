import repositoryService from './repository-service.js';

/**
 * Middleware to check for the presence of an access token in the session.
 * If absent, it responds with a 401 Unauthorized error.
 */
export function checkAccessToken(req, res, next) {
  if (!req.session.access_token) {
    return res.status(401).json({ error: 'Unauthorized: No access token available' });
  }
  next();
}

/**
 * Retrieves all repositories with optional pagination and search.
 */
export async function getAllRepositoriesHandler(req, res, next) {
  try {
    const { limit, page, search } = req.query;
    const token = req.session.access_token;
    const repositories = await repositoryService.getRepositories(token, limit, page, search);
    res.status(200).json(repositories);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a repository by ID.
 */
export async function getRepositoryByIdHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { lastActivityAt } = req.query;
    const token = req.session.access_token;
    const repository = await repositoryService.getRepositoryById(id, lastActivityAt, token);
    res.status(200).json(repository);
  } catch (error) {
    next(error);
  }
}

/**
 * Updates a repository.
 */
export async function updateRepositoryHandler(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updatedRepo = await repositoryService.updateRepository(id, fields);
    res.status(200).json(updatedRepo);
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a repository.
 */
export async function deleteRepositoryHandler(req, res, next) {
  try {
    const { id } = req.params;
    await repositoryService.deleteRepository(id);
    res.status(200).json({ message: 'Repository and related data deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a commit from a repository.
 */
export async function deleteCommitHandler(req, res, next) {
  try {
    const { id, commitId } = req.params;
    await repositoryService.deleteCommit(id, commitId);
    res.status(200).json({ message: 'Commit deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a branch from a repository.
 */
export async function deleteBranchHandler(req, res, next) {
  try {
    const { id, branchId } = req.params;
    await repositoryService.deleteBranch(id, branchId);
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export default {
  checkAccessToken,
  getAllRepositoriesHandler,
  getRepositoryByIdHandler,
  updateRepositoryHandler,
  deleteRepositoryHandler,
  deleteCommitHandler,
  deleteBranchHandler,
};
