const OpenAI = require('openai');
const { pool } = require('../config/db');
const cacheUtil = require('../utils/cacheUtil');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

exports.getAIResponse = async (question, repoId) => {
    try {
        let repoData = cacheUtil.get(repoId);
        if (!repoData) {
            const repoResult = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
            const commitsResult = await pool.query('SELECT * FROM commits WHERE repository_id = $1', [repoId]);
            const branchesResult = await pool.query('SELECT * FROM branches WHERE repository_id = $1', [repoId]);

            repoData = {
                repository: repoResult.rows[0],
                commits: commitsResult.rows,
                branches: branchesResult.rows,
            };

            cacheUtil.set(repoId, repoData);
        }

        // Validate and format repository details
        const repo = repoData.repository || {};
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
