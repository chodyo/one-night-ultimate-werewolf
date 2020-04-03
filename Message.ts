import { Schema, type } from "@colyseus/schema";

// Server => Client communication
// {
//     messageType: "notification" | "debug" | "message" | "broadcast",
//     message: string
// }

enum messageTypes {
    message = "message", // one player to all players
    privateMessage = "privateMessage", // one player to one other player

    notification = "notification", // server to single client, relating to the game
    broadcast = "broadcast", // server to all clients, relating to the game
    debug = "debug" // server to single client, relating to a problem the server encountered (invalid request).
}
type messageType = keyof typeof messageTypes;

/**
 * A message from one player to all players.
 */
export class Message extends Schema {
    @type("string") messageType: messageType = messageTypes.message; // TODO: for some reason this isn't being serialized to the client
    @type("string") message: string;

    constructor(message: string) {
        super();

        this.message = message;
    }
}

/**
 * A message from one player to one other player.
 */
export class PrivateMessage extends Schema {
    @type("string") messageType: messageType = messageTypes.privateMessage;
    @type("string") message: string;

    constructor(message: string) {
        super(message);

        this.message = message;
    }
}

/**
 * A game message from the server to a single client.
 */
export class Notification extends Schema {
    @type("string") messageType: messageType = messageTypes.notification;
    @type("string") message: string;

    constructor(message: string) {
        super(message);

        this.message = message;
    }
}

/**
 * A game message from the server to all clients.
 */
export class Broadcast extends Schema {
    @type("string") messageType: messageType = messageTypes.broadcast;
    @type("string") message: string;

    constructor(message: string) {
        super(message);

        this.message = message;
    }
}

/**
 * A non-game related message to a single client, used for debugging purposes only (for example, a bad request).
 */
export class Debug extends Schema {
    @type("string") messageType: messageType = messageTypes.debug;
    @type("string") message: string;

    constructor(message: string) {
        super(message);

        this.message = message;
    }
}
