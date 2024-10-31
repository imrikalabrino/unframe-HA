const aiService = require('../services/aiService');

exports.askAI = async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const response = await aiService.getAIResponse(question);
        res.json({ response });
    } catch (error) {
        console.error('Error fetching AI response:', error);
        res.status(500).send('Failed to get response from AI');
    }
};
