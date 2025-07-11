import jwt from 'jsonwebtoken';
import settings from '../config/settings.js';
import { logger } from '../app.js';

export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            throw new Error('Authentication error: No token provided');
        }

        const decoded = jwt.verify(token, settings.app.secret);
        socket.user = decoded;
        next();
    } catch (error) {
        logger.error(`Socket authentication failed: ${error.message}`);
        next(new Error('Authentication error'));
    }
};

export const authorizeChannel = (channelName) => {
    return async (socket, next) => {
        try {
            const userId = socket.user.id;
            const isPrivate = channelName.startsWith('private-');
            const isPresence = channelName.startsWith('presence-');

            if (!isPrivate && !isPresence) {
                return next();
            }

            // In a real app, you would verify channel access with Laravel
            const canAccess = true; // Replace with actual check

            if (!canAccess) {
                throw new Error('Authorization error: Channel access denied');
            }

            next();
        } catch (error) {
            logger.error(`Channel authorization failed: ${error.message}`);
            next(new Error('Authorization error'));
        }
    };
};