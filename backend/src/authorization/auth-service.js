const axios = require('axios');

/**
 * Exchanges an authorization code for a GitLab access token.
 *
 * @param {string} code - The authorization code received from GitLab during OAuth.
 * @returns {Promise<string>} - The access token for accessing GitLab APIs.
 * @throws {Error} - Throws an error if the token exchange request fails.
 */
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

/**
 * Checks the validity of the access token stored in the session.
 *
 * @param {object} session - The session object, expected to contain the access token.
 * @returns {object} - An object indicating whether the token is valid (`{ valid: true }`) or not (`{ valid: false }`).
 */
exports.checkToken = (session) => {
    return session && session.access_token ? { valid: true } : { valid: false };
};