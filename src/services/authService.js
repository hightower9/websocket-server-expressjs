import jwt from 'jsonwebtoken';
import axios from 'axios';
import settings from '../config/settings.js';
import logger from '../utils/logger.js';

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, settings.app.secret);
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        return null;
    }
};

export const authenticateWithLaravel = async (socketId, channelName, authToken) => {
    try {
        const response = await axios.post(
            `${settings.app.laravelUrl}/api/broadcasting/auth`,
            { socket_id: socketId, channel_name: channelName },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(`Laravel authentication failed: ${error.message}`);
        throw error;
    }
};

export const generateSocketToken = (userId) => {
    return jwt.sign(
        { id: userId },
        settings.app.secret,
        { expiresIn: settings.jwt.expiresIn, issuer: settings.jwt.issuer }
    );
};