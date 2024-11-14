import express from 'express';
import {
  askAIHandler,
  getChatHistoryHandler,
} from './ai-controller.js';

const router = express.Router();

router.post('/', askAIHandler);
router.get('/history/:repoId', getChatHistoryHandler);

export default router;
