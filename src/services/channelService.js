import { logger } from '../app.js';

export const handleConnection = (io, socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.user?.id || 'anonymous'})`);

    // Join default channel
    socket.join(`user-${socket.user.id}`);

    // Handle channel subscriptions
    socket.on('subscribe', (channelName) => {
        subscribeToChannel(io, socket, channelName);
    });

    socket.on('unsubscribe', (channelName) => {
        unsubscribeFromChannel(socket, channelName);
    });

    // Handle private messages
    socket.on('private-message', ({ userId, message }) => {
        sendPrivateMessage(io, socket, userId, message);
    });
};

const subscribeToChannel = (io, socket, channelName) => {
    try {
        // Validate channel name
        if (!channelName || typeof channelName !== 'string') {
            throw new Error('Invalid channel name');
        }

        // Check authorization for private/presence channels
        if (channelName.startsWith('private-') || channelName.startsWith('presence-')) {
            authorizeChannel(channelName)(socket, (err) => {
                if (err) throw err;
                socket.join(channelName);
                logger.info(`User ${socket.user.id} joined channel ${channelName}`);

                if (channelName.startsWith('presence-')) {
                    io.to(channelName).emit('presence-updated', {
                        event: 'member-added',
                        user: socket.user
                    });
                }
            });
        } else {
            socket.join(channelName);
            logger.info(`User ${socket.user.id} joined channel ${channelName}`);
        }
    } catch (error) {
        logger.error(`Subscription error: ${error.message}`);
        socket.emit('error', { message: error.message });
    }
};

const unsubscribeFromChannel = (socket, channelName) => {
    try {
        socket.leave(channelName);
        logger.info(`User ${socket.user.id} left channel ${channelName}`);

        if (channelName.startsWith('presence-')) {
            socket.to(channelName).emit('presence-updated', {
                event: 'member-removed',
                user: socket.user
            });
        }
    } catch (error) {
        logger.error(`Unsubscription error: ${error.message}`);
        socket.emit('error', { message: error.message });
    }
};

const sendPrivateMessage = (io, socket, userId, message) => {
    try {
        if (!userId || !message) {
            throw new Error('Invalid message data');
        }

        io.to(`user-${userId}`).emit('private-message', {
            from: socket.user.id,
            message
        });
    } catch (error) {
        logger.error(`Private message error: ${error.message}`);
        socket.emit('error', { message: error.message });
    }
};