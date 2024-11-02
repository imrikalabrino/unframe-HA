const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');

router.get('/', repositoryController.getAllRepositories);
router.get('/:id', repositoryController.getRepositoryById);
router.patch('/:id', repositoryController.updateRepository);
router.delete('/:id', repositoryController.deleteRepository);
router.delete('/:id/commits/:commitId', repositoryController.deleteCommit);
router.delete('/:id/branches/:branchId', repositoryController.deleteBranch);

module.exports = router;
