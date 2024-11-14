import aiService from './ai-service.js';
import logger from '../middleware/logger.js';

/**
 * Handles AI questions about a repository.
 *
 * @param {object} req - The request object, containing `body` with `question` and `repoId`.
 * @param {object} res - The response object, used to send back the AI response.
 * @param {Function} next - The next middleware function.
 */
export async function askAIHandler(req, res, next) {
    const { question, repoId } = req.body;

    if (!question || !repoId) {
        return res.status(400).json({ error: 'Question and repository ID are required' });
    }

    try {
        const response = await aiService.getAIResponse(question, repoId);

        await aiService.storeConversation(repoId, question, 'user');
        await aiService.storeConversation(repoId, response, 'assistant');

        res.json({ response });
    } catch (error) {
        logger.error(`Error in askAIHandler: ${error.message}`, { error });
        next(error);
    }
}

/**
 * Retrieves chat history for a specific repository.
 *
 * @param {object} req - The request object, containing `params` with `repoId`.
 * @param {object} res - The response object, used to send back the chat history.
 * @param {Function} next - The next middleware function.
 */
export async function getChatHistoryHandler(req, res, next) {
  const { repoId } = req.params;

  if (!repoId) {
    return res.status(400).json({ error: 'Repository ID is required' });
  }

  try {
    const history = await aiService.getChatHistory(repoId);
    res.json({ history });
  } catch (error) {
    logger.error(`Error in getChatHistoryHandler: ${error.message}`, { error });
    next(error);
  }
}
