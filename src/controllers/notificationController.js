import { io } from '../server.js';
import logger from '../utils/logger.js';

export const sendNotification = async (req, res) => {
    try {
        const { userId, event, data } = req.body;

        if (!userId || !event) {
            return res.status(400).json({ error: 'User ID and event are required' });
        }

        io.to(`user-${userId}`).emit(event, data);
        logger.info(`Sent notification "${event}" to user "${userId}"`);

        res.json({ success: true });
    } catch (error) {
        logger.error(`Notification error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const broadcastToUsers = async (req, res) => {
    try {
        const { userIds, event, data } = req.body;

        if (!userIds || !Array.isArray(userIds) || !event) {
            return res.status(400).json({ error: 'User IDs array and event are required' });
        }

        userIds.forEach(userId => {
            io.to(`user-${userId}`).emit(event, data);
        });

        logger.info(`Broadcasted event "${event}" to ${userIds.length} users`);
        res.json({ success: true });
    } catch (error) {
        logger.error(`Multi-user broadcast error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};