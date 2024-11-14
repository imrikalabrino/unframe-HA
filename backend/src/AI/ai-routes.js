import express from 'express';
import {
  askAIHandler,
  getChatHistoryHandler,
} from './ai-controller.js';
import { apiAuthentication } from '../middleware/api-authentication.js';

const router = express.Router();

router.post('/', apiAuthentication, askAIHandler);
router.get('/history/:repoId', getChatHistoryHandler);

export default router;
