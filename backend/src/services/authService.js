const axios = require('axios');

exports.getGitlabToken = async (code) => {
    const tokenResponse = await axios.post('https://gitlab.com/oauth/token', {
        client_id: process.env.GITLAB_CLIENT_ID,
        client_secret: process.env.GITLAB_CLIENT_SECRET,
        redirect_uri: process.env.GITLAB_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
    });
    return tokenResponse.data.access_token;
};

exports.checkToken = (session) => {
    return session && session.access_token ? { valid: true } : { valid: false };
};