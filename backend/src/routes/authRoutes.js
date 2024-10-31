const express = require('express');
const axios = require('axios');
const router = express.Router();
const { gitlabClientId, gitlabClientSecret, gitlabRedirectUri } = require('../config/settings');

router.get('/gitlab', (req, res) => {
    const authUrl = `https://gitlab.com/oauth/authorize?client_id=${gitlabClientId}&redirect_uri=${gitlabRedirectUri}&response_type=code&scope=read_api`;
    res.redirect(authUrl);
});

router.get('/gitlab/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://gitlab.com/oauth/token', {
            client_id: gitlabClientId,
            client_secret: gitlabClientSecret,
            redirect_uri: gitlabRedirectUri,
            grant_type: 'authorization_code',
            code: code,
        });
        req.session.access_token = response.data.access_token;
        res.redirect('/repositories');
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;
