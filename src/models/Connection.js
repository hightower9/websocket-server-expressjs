export class Connection {
    constructor(socketId, userId) {
        this.socketId = socketId;
        this.userId = userId;
        this.connectedAt = new Date();
        this.channels = new Set();
    }

    joinChannel(channelName) {
        this.channels.add(channelName);
    }

    leaveChannel(channelName) {
        this.channels.delete(channelName);
    }

    isInChannel(channelName) {
        return this.channels.has(channelName);
    }
}