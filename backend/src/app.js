const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const repoRoutes = require('./routes/repositoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const app = express();
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

app.use(logger);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use('/auth', authRoutes);
app.use('/repositories', repoRoutes);
app.use('/ask-ai', aiRoutes);

app.get('/test-db', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({ connected: true });
    } catch (error) {
        console.error('Database connection error:', error);
        res.json({ connected: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('GitLab OAuth2 Integration Server');
});

app.use(errorHandler);

module.exports = app;
