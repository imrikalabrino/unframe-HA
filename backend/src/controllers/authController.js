const authService = require('../services/authService');

exports.authenticateGitlab = (req, res) => {
    const { redirectUrl } = req.query;
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_CLIENT_ID}&redirect_uri=${process.env.GITLAB_REDIRECT_URI}&response_type=code&scope=read_api&state=${encodeURIComponent(redirectUrl)}`;
    res.redirect(gitlabAuthUrl);
};

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

exports.checkToken = (req, res) => {
    const result = authService.checkToken(req.session);
    res.json(result);
};
