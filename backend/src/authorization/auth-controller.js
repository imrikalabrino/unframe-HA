const authService = require('./auth-service');

/**
 * Initiates the GitLab OAuth authentication flow.
 * Redirects the user to GitLab's authorization URL to obtain an authorization code.
 *
 * @param {object} req - The request object, containing the query parameter `redirectUrl` for post-auth redirection.
 * @param {object} res - The response object used to redirect to GitLab's OAuth authorization URL.
 */
exports.authenticateGitlab = (req, res) => {
    let { redirectUrl } = req.query;
    if (req.query === undefined) {
        redirectUrl = `http://localhost:${process.env.PORT}/repositories`
    }
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_CLIENT_ID}&redirect_uri=${process.env.GITLAB_REDIRECT_URI}&response_type=code&scope=read_api&state=${encodeURIComponent(redirectUrl)}`;
    res.redirect(gitlabAuthUrl);
};

/**
 * Handles the callback from GitLab after authentication.
 * Exchanges the authorization code for an access token and stores it in the session.
 * Redirects the user to the specified redirect URL or to the `/repositories` page by default.
 *
 * @param {object} req - The request object, containing the query parameters `code` (authorization code) and `state` (redirect URL).
 * @param {object} res - The response object, used to redirect to the appropriate page after authentication.
 */
exports.gitlabCallback = async (req, res) => {
    const { code, state: redirectUrl } = req.query;

    try {
        req.session.access_token = await authService.getGitlabToken(code);
        res.redirect(redirectUrl || '/repositories');
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Authentication failed');
    }
};

/**
 * Checks the validity of the access token stored in the session.
 * Responds with a JSON object indicating whether the token is valid.
 *
 * @param {object} req - The request object, containing the session with the access token.
 * @param {object} res - The response object, used to send back a JSON result indicating token validity.
 */
exports.checkToken = (req, res) => {
    const result = authService.checkToken(req.session);
    res.json(result);
};
