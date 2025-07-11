import { io } from '../server.js';
import { logger } from '../app.js';

export const broadcastToChannel = async (req, res) => {
    try {
        const { channel, event, data } = req.body;

        if (!channel || !event) {
            return res.status(400).json({ error: 'Channel and event are required' });
        }

        io.to(channel).emit(event, data);
        logger.info(`Broadcasted event "${event}" to channel "${channel}"`);

        res.json({ success: true });
    } catch (error) {
        logger.error(`Broadcast error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getChannelMembers = async (req, res) => {
    try {
        const { channel } = req.params;

        if (!channel) {
            return res.status(400).json({ error: 'Channel is required' });
        }

        const sockets = await io.in(channel).fetchSockets();
        const members = sockets.map(socket => socket.user);

        res.json({ members });
    } catch (error) {
        logger.error(`Get members error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};