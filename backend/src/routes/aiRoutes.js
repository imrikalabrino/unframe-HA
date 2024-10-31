const express = require('express');
const aiController = require('../controllers/aiController');
const router = express.Router();

router.post('/', aiController.askAI);

module.exports = router;
