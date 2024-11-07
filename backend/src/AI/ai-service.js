const OpenAI = require('openai');
const { pool } = require('../config/db');
const cacheUtil = require('../utils/cache-util');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

/**
 * Generates an AI response based on a question about a specific repository.
 *
 * @param {string} question - The question asked about the repository.
 * @param {number} repoId - The ID of the repository in question.
 * @returns {Promise<string>} - The AI-generated response based on repository details.
 */
exports.getAIResponse = async (question, repoId) => {
    try {
        let repoData = cacheUtil.get(repoId);

        // If repoData is not in cache, fetch it from the database
        if (!repoData) {
            const repoResult = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
            const commitsResult = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
            const branchesResult = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

            repoData = {
                id: repoResult.rows[0].id,
                name: repoResult.rows[0].name,
                description: repoResult.rows[0].description,
                author: repoResult.rows[0].author,
                last_activity_at: repoResult.rows[0].last_activity_at,
                visibility: repoResult.rows[0].visibility,
                commits: commitsResult.rows,
                branches: branchesResult.rows,
            };
        }

        // Validate and format repository details
        const repo = repoData || {};
        const commitsText = repoData.commits
            ? repoData.commits.map(commit => `- ${commit.message} (Author: ${commit.author}, Date: ${commit.date})`).join('\n')
            : "No commits available";

        const branchesText = repoData.branches
            ? repoData.branches.map(branch => branch.name).join(', ')
            : "No branches available";

        // Construct the prompt with repository details
        const prompt = `
            Repository Name: ${repo.name || 'N/A'}
            Description: ${repo.description || 'N/A'}
            Author: ${repo.author || 'N/A'}
            Last Activity Date: ${repo.last_activity_at || 'N/A'}
            Visibility: ${repo.visibility || 'N/A'}
            
            Commits:
            ${commitsText}
            
            Branches:
            ${branchesText}
            
            Question: ${question}
            
            Answer the question using only the information provided about the repository in a concise manner.
        `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: "system", content: "You are an assistant with knowledge of this repository's details." },
                { role: "user", content: prompt },
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error with OpenAI API:', error.toString());
        if (error.response) {
            console.error('OpenAI API response error:', error.response.data);
        } else {
            console.error('OpenAI API request error:', error.message);
        }
        throw new Error('Failed to get response from AI');
    }
};
