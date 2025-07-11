export class Channel {
    constructor(name, type = 'public') {
        this.name = name;
        this.type = type;
        this.members = new Set();
        this.createdAt = new Date();
    }

    addMember(userId) {
        this.members.add(userId);
    }

    removeMember(userId) {
        this.members.delete(userId);
    }

    getMemberCount() {
        return this.members.size;
    }

    hasMember(userId) {
        return this.members.has(userId);
    }
}