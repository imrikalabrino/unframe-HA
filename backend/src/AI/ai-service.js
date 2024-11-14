import OpenAI from 'openai';
import { pool } from '../config/db.js';
import cacheUtil from '../utils/cache-util.js';

const openai = new OpenAI();

/**
 * Generates an AI response based on a question about a specific repository.
 *
 * @param {string} question - The question asked about the repository.
 * @param {number} repoId - The ID of the repository in question.
 * @returns {Promise<string>} - The AI-generated response based on repository details.
 * @throws {Error} - Throws an error if AI response generation fails.
 */
async function getAIResponse(question, repoId, apiKey) {
  openai.apiKey = apiKey;

  try {
    let repoData = cacheUtil.get(repoId);

    // If repoData is not in cache, fetch it from the database
    if (!repoData) {
      const repoResult = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
      const commitsResult = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
      const branchesResult = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

      if (repoResult.rows.length === 0) {
        throw new Error('Repository not found');
      }

      repoData = {
        id: repoResult.rows[0].id,
        name: repoResult.rows[0].name,
        description: repoResult.rows[0].description,
        author: repoResult.rows[0].author,
        last_activity_at: repoResult.rows[0].last_activity_at,
        visibility: repoResult.rows[0].visibility,
        topics: repoResult.rows[0].topics || [],
        default_branch: repoResult.rows[0].default_branch || 'N/A',
        license_name: repoResult.rows[0].license_name || 'N/A',
        avatar_url: repoResult.rows[0].avatar_url || 'N/A',
        readme_url: repoResult.rows[0].readme_url || 'N/A',
        commits: commitsResult.rows,
        branches: branchesResult.rows,
      };

      // Update the cache with the new repo data
      cacheUtil.set(repoId, repoData);
    }

    const repo = repoData || {};

    // Validate and format repository details
    const commitsText = repo.commits
      ? repo.commits.map(commit => `- ${commit.message} (Author: ${commit.author}, Date: ${commit.date})`).join('\n')
      : "No commits available";

    const branchesText = repo.branches
      ? repo.branches.map(branch => branch.name).join(', ')
      : "No branches available";

    const conversationResult = await pool.query(
      'SELECT message, role FROM conversations WHERE repository_id = $1 ORDER BY created_at',
      [repoId]
    );
    const conversationHistory = conversationResult.rows.map((row) => ({ role: row.role, content: row.message }));

    // Construct the prompt with repository details
    const prompt = `
      Repository Name: ${repo.name || 'N/A'}
      Description: ${repo.description || 'N/A'}
      Author: ${repo.author || 'N/A'}
      Last Activity Date: ${repo.last_activity_at || 'N/A'}
      Visibility: ${repo.visibility || 'N/A'}
      Topics: ${repo.topics.length > 0 ? repo.topics.join(', ') : 'None'}
      Default Branch: ${repo.default_branch || 'N/A'}
      License Name: ${repo.license_name || 'N/A'}
      Avatar URL: ${repo.avatar_url || 'N/A'}
      README URL: ${repo.readme_url || 'N/A'}
      
      Commits:
      ${commitsText}
      
      Branches:
      ${branchesText}
      
      Question: ${question}
      
      Answer the question using only the information provided about the repository in a concise manner.
    `;

    // Generate AI response using the existing OpenAI initialization
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: "system", content: "You are an assistant with knowledge of this repository's details." },
        ...conversationHistory,
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.5,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error(`Error in getAIResponse: ${error.message}`, { error });
    throw new Error('Failed to get response from AI');
  }
}

/**
 * Retrieves the chat history for a specific repository.
 *
 * @param {number} repoId - The ID of the repository.
 * @returns {Promise<Array>} - An array of conversation objects containing messages and roles.
 * @throws {Error} - Throws an error if fetching chat history fails.
 */
async function getChatHistory(repoId) {
  try {
    const result = await pool.query(
      'SELECT message, role, created_at FROM conversations WHERE repository_id = $1 ORDER BY created_at ASC',
      [repoId]
    );
    return result.rows;
  } catch (error) {
    console.error(`Error in getChatHistory: ${error.message}`, { error });
    throw new Error('Failed to get chat history');
  }
}

/**
 * Stores a conversation message in the database.
 *
 * @param {number} repoId - The ID of the repository.
 * @param {string} message - The message content.
 * @param {string} role - The role of the message sender ('user' or 'assistant').
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if storing the conversation fails.
 */
async function storeConversation(repoId, message, role) {
  try {
    await pool.query(
      'INSERT INTO conversations (repository_id, message, role) VALUES ($1, $2, $3)',
      [repoId, message, role]
    );
  } catch (error) {
    console.error(`Error in storeConversation: ${error.message}`, { error });
    throw new Error('Failed to store conversation');
  }
}

export default {
  getAIResponse,
  getChatHistory,
  storeConversation,
};
