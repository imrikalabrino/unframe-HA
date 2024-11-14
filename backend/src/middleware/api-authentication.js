const apiKeyStore = {};

export const apiAuthentication = (req, res, next) => {
    const apiKey = req.headers['apikey'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key is missing' });
    }

    req.apiKey = apiKey;
    next();
};
