const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

app.get('/auth/gitlab', (req, res) => {
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_CLIENT_ID}&redirect_uri=${process.env.GITLAB_REDIRECT_URI}&response_type=code&scope=read_api`;
    res.redirect(gitlabAuthUrl);
});

app.get('/auth/gitlab/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const tokenResponse = await axios.post('https://gitlab.com/oauth/token', {
            client_id: process.env.GITLAB_CLIENT_ID,
            client_secret: process.env.GITLAB_CLIENT_SECRET,
            redirect_uri: process.env.GITLAB_REDIRECT_URI,
            grant_type: 'authorization_code',
            code: code,
        });

        const { access_token } = tokenResponse.data;

        res.json({ access_token });
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Authentication failed');
    }
});

app.get('/', (req, res) => {
    res.send('GitLab OAuth2 Integration Server');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
