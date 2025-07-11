// Express app setup

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import settings from './config/settings.js';
import logger from './utils/logger.js';
import { authenticateUser, generateToken } from './controllers/authController.js';
import { broadcastToChannel, getChannelMembers } from './controllers/channelController.js';
import { sendNotification, broadcastToUsers } from './controllers/notificationController.js';
import { pubClient } from './server.js'; // Import Redis client from server.js

const app = express();

// Middleware
app.use(cors({
    origin: settings.app.env === 'development' 
        ? '*' 
        : [settings.app.laravelUrl], // Restrict in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    const healthcheck = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: Date.now(),
        checks: {
            redis: pubClient?.status === 'ready' ? 'healthy' : 'unhealthy',
            memory: process.memoryUsage(),
            database: 'connected' // Add your DB checks if applicable
        }
    };

    res.status(200).json(healthcheck);
});

// API Routes
const apiRouter = express.Router();

// Authentication routes
apiRouter.post('/auth/token', generateToken);
apiRouter.post('/auth/socket', authenticateUser);

// Channel routes
apiRouter.post('/channels/broadcast', broadcastToChannel);
apiRouter.get('/channels/:channel/members', getChannelMembers);

// Notification routes
apiRouter.post('/notifications/send', sendNotification);
apiRouter.post('/notifications/broadcast', broadcastToUsers);

// Mount API router
app.use('/api', apiRouter);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        error: {
            message: 'Not Found',
            details: `Route ${req.method} ${req.originalUrl} not found`
        }
    });
});

// Enhanced error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;
    
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        statusCode
    });

    res.status(statusCode).json({
        error: {
            message,
            ...(settings.app.env === 'development' && { 
                stack: err.stack,
                details: err.details 
            })
        }
    });
});

export { app, logger };