import express from 'express';
import {
    checkAccessToken,
    getAllRepositoriesHandler,
    getRepositoryByIdHandler,
    updateRepositoryHandler,
    deleteRepositoryHandler,
    deleteCommitHandler,
    deleteBranchHandler
} from './repository-controller.js';

const router = express.Router();

router.use(checkAccessToken);

router.get('/', getAllRepositoriesHandler);
router.get('/:id', getRepositoryByIdHandler);
router.patch('/:id', updateRepositoryHandler);
router.delete('/:id', deleteRepositoryHandler);
router.delete('/:id/commits/:commitId', deleteCommitHandler);
router.delete('/:id/branches/:branchId', deleteBranchHandler);

export default router;
