const express = require('express');
const aiController = require('./ai-controller');
const router = express.Router();

router.post('/', aiController.askAI);

module.exports = router;
