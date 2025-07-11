import { io } from '../server.js';
import logger from '../utils/logger.js';

export const sendToUser = (userId, event, data) => {
    try {
        if (!userId || !event) {
            throw new Error('User ID and event are required');
        }
        io.to(`user-${userId}`).emit(event, data);
        logger.info(`Notification sent to user ${userId}: ${event}`);
        return true;
    } catch (error) {
        logger.error(`Notification error: ${error.message}`);
        return false;
    }
};

export const sendToUsers = (userIds, event, data) => {
    try {
        if (!userIds || !Array.isArray(userIds) || !event) {
            throw new Error('User IDs array and event are required');
        }
        userIds.forEach(userId => {
            io.to(`user-${userId}`).emit(event, data);
        });
        logger.info(`Notification sent to ${userIds.length} users: ${event}`);
        return true;
    } catch (error) {
        logger.error(`Multi-user notification error: ${error.message}`);
        return false;
    }
};

export const sendToRole = async (role, event, data) => {
    try {
        // In a real app, you would fetch users with this role from your database
        const userIds = []; // Replace with actual user IDs having this role
        return sendToUsers(userIds, event, data);
    } catch (error) {
        logger.error(`Role-based notification error: ${error.message}`);
        return false;
    }
};