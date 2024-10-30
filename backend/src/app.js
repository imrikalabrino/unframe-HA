const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors')
const session = require('express-session');
require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

        req.session.access_token = access_token;

        res.redirect('/repositories');
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Authentication failed');
    }
});

app.get('/repositories', async (req, res) => {
    const token = req.session.access_token;

    if (!token) {
        return res.status(401).send('Unauthorized: No access token available');
    }

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || '';

    try {
        const response = await axios.get('https://gitlab.com/api/v4/projects', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                visibility: 'public',
                per_page: limit,
                page: page,
                search: search,
                order_by: 'last_activity_at', //TODO: Add support for different filtering
                simple: true,
            },
        });

        const repositories = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            author: repo.namespace ? repo.namespace.name : 'Unknown',
            last_activity_at: repo.last_activity_at,
            description: repo.description, //TODO: Make sure it's easy to add more data fields
        }));

        res.json(repositories);
    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).send('Failed to fetch repositories');
    }
});


app.get('/', (req, res) => {
    res.send('GitLab OAuth2 Integration Server');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
