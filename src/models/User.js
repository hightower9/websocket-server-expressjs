export class User {
    constructor(id, name, email, roles = []) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.connections = new Set();
    }

    addConnection(connectionId) {
        this.connections.add(connectionId);
    }

    removeConnection(connectionId) {
        this.connections.delete(connectionId);
    }

    hasRole(role) {
        return this.roles.includes(role);
    }
}