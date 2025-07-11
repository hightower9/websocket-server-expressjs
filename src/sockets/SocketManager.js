import logger from '../utils/logger.js';

class SocketManager {
    constructor(io) {
        this.io = io;
        this.connections = new Map();
    }

    addConnection(socket) {
        const { userId } = socket;
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId).add(socket.id);
        logger.info(`User ${userId} connected with socket ${socket.id}`);
    }

    removeConnection(socket) {
        const { userId } = socket;
        if (this.connections.has(userId)) {
            this.connections.get(userId).delete(socket.id);
            if (this.connections.get(userId).size === 0) {
                this.connections.delete(userId);
            }
            logger.info(`User ${userId} disconnected from socket ${socket.id}`);
        }
    }

    getSocketsForUser(userId) {
        return this.connections.get(userId) || new Set();
    }

    getUserCount() {
        return this.connections.size;
    }

    broadcastToUser(userId, event, data) {
        const sockets = this.getSocketsForUser(userId);
        sockets.forEach(socketId => {
            this.io.to(socketId).emit(event, data);
        });
    }

    broadcastToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }
}

export default SocketManager;