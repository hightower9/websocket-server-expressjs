// Socket.IO server setup

import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { app } from './app.js';
import settings from './config/settings.js';
import { authenticateSocket } from './middlewares/authMiddleware.js';
import { handleConnection } from './services/channelService.js';
import SocketManager from './sockets/SocketManager.js';
import logger from './utils/logger.js'; 

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: settings.app.env === 'development'
            ? '*'
            : [settings.app.laravelUrl], // More secure CORS in production
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    },
    connectionStateRecovery: {
        // Enable reconnection with missed events
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    maxHttpBufferSize: 1e8 // 100MB max payload
});

// Redis setup for scaling
const pubClient = new Redis({
    host: settings.redis.host,
    port: settings.redis.port,
    password: settings.redis.password,
    retryStrategy: (times) => {
        if (times > 10) {
            logger.error('Max Redis reconnection attempts reached');
            return null; // Stop retrying
        }
        const delay = Math.min(times * 100, 5000);
        return delay;
    },
    reconnectOnError: (err) => {
        logger.error(`Redis connection error: ${err.message}`);
        return true; // Always attempt to reconnect
    }
});

const subClient = pubClient.duplicate();

// Handle Redis connection events
pubClient.on('connect', () => logger.info('Connected to Redis pub client'));
pubClient.on('ready', () => logger.info('Redis pub client ready'));
pubClient.on('error', (err) => logger.error(`Redis pub error: ${err.message}`));

subClient.on('connect', () => logger.info('Connected to Redis sub client'));
subClient.on('ready', () => logger.info('Redis sub client ready'));
subClient.on('error', (err) => logger.error(`Redis sub error: ${err.message}`));

// Initialize Redis adapter
io.adapter(createAdapter(pubClient, subClient));

// Add ping interval to keep connection alive
const redisPingInterval = setInterval(() => {
    pubClient.ping().catch(err => {
        logger.error(`Redis ping failed: ${err.message}`);
    });
}, 30000); // Every 30 seconds

// Cleanup on server shutdown
const gracefulShutdown = () => {
    logger.info('Shutting down server gracefully...');

    clearInterval(redisPingInterval);

    io.close(() => {
        logger.info('Socket.IO server closed');
        pubClient.quit();
        subClient.quit();
        process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
        logger.error('Forcing server shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Initialize SocketManager
const socketManager = new SocketManager(io);

// Socket.IO middleware for authentication
io.use(authenticateSocket);

// Handle connection
io.on('connection', (socket) => {
    // Store the connection time
    socket.connectedAt = new Date();

    // Add to connection manager
    socketManager.addConnection(socket);

    logger.info(`New connection: ${socket.id} (User: ${socket.user?.id || 'unauthenticated'}, IP: ${socket.handshake.address})`);

    // Handle connection
    handleConnection(io, socket);

    socket.on('disconnect', (reason) => {
        socketManager.removeConnection(socket);
        logger.info(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    });

    socket.on('error', (err) => {
        logger.error(`Socket error (${socket.id}): ${err.message}`);
    });
});

httpServer.listen(settings.app.port, () => {
    logger.info(`WebSocket server running on port ${settings.app.port}`);
    logger.info(`Environment: ${settings.app.env}`);
});

export { io, pubClient, subClient }; // Export Redis clients for health checks