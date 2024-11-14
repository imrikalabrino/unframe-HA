import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import authRoutes from './authorization/auth-routes.js';
import repoRoutes from './repositories/repository-routes.js';
import aiRoutes from './AI/ai-routes.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error-handler.js';
import helmet from 'helmet';

dotenv.config();

const app = express();

// Middleware
app.use(logger);
app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));

// Routes
app.use('/auth', authRoutes);
app.use('/repositories', repoRoutes);
app.use('/ask-ai', aiRoutes);

app.get('/test-db', async (req, res, next) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({ connected: true });
    } catch (error) {
        next(error);
    }
});

app.get('/', (req, res) => {
    res.send('GitLab OAuth2 Integration Server');
});

// Error Handling
app.use(errorHandler);

export default app;
