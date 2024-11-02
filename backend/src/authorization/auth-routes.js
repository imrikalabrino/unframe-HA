const express = require('express');
const router = express.Router();
const authController = require('./auth-controller');

router.get('/gitlab', authController.authenticateGitlab);
router.get('/gitlab/callback', authController.gitlabCallback);
router.get('/check-token', authController.checkToken);

module.exports = router;
