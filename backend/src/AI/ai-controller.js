const aiService = require('./ai-service');

exports.askAI = async (req, res) => {
    const { question, repoId } = req.body;
    if (!question || !repoId) {
        return res.status(400).json({ error: 'Question and repository ID are required' });
    }

    try {
        const response = await aiService.getAIResponse(question, repoId);
        res.json({ response });
    } catch (error) {
        console.error('Error fetching AI response:', error);
        res.status(500).send('Failed to get response from AI');
    }
};
