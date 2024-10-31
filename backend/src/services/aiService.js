const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

exports.getAIResponse = async (question) => {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: question },
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
