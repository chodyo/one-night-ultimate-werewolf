import { Schema, type } from "@colyseus/schema";
import { Room, Client } from "colyseus";

// Server => Client communication
// {
//     messageType: "blast" | "whisper" | "notification" | "broadcast" | "debug",
//     message: string,
//     from: string,
//     data: {foo: bar}
// }

enum messageTypes {
    blast = "blast", // one player to all players
    whisper = "whisper", // one player to one other player

    notification = "notification", // server to single client, relating to the game
    broadcast = "broadcast", // server to all clients, relating to the game
    debug = "debug", // server to single client, relating to a problem the server encountered (invalid request).
}
type messageType = keyof typeof messageTypes;

export class Messager {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    /**
     * A message from one player to all players.
     */
    Blast(from: string, msg: string) {
        let message = new Blast(from, msg);
        this.room.broadcast(message);
    }

    /**
     * A message from one player to one other player.
     */
    Whisper(from: string, to: Client, msg: string) {
        let message = new Whisper(from, msg);
        this.room.send(to, message);
    }

    /**
     * A game message from the server to a single client.
     */
    Notify(to: Client, msg: string, data?: string) {
        let message = new Notification(msg, data);
        this.room.send(to, message);
    }

    /**
     * A game message from the server to all clients.
     */
    Broadcast(msg: string) {
        let message = new Broadcast(msg);
        this.room.broadcast(message);
    }

    /**
     * A non-game related message to a single client, used for debugging purposes only (for example, a bad request).
     */
    Debug(to: Client, msg: string) {
        let message = new Debug(msg);
        this.room.send(to, message);
    }
}

class Blast extends Schema {
    @type("string") messageType: messageType = messageTypes.blast;
    @type("string") from: string;
    @type("string") message: string;

    constructor(from: string, message: string) {
        super();

        this.from = from;
        this.message = message;
    }
}

class Whisper extends Schema {
    @type("string") messageType: messageType = messageTypes.whisper;
    @type("string") from: string;
    @type("string") message: string;

    constructor(from: string, message: string) {
        super(message);

        this.from = from;
        this.message = message;
    }
}

class Notification extends Schema {
    @type("string") messageType: messageType = messageTypes.notification;
    @type("string") from: string = "server";
    @type("string") message: string;
    @type("string") data?: string;

    constructor(message: string, data?: string) {
        super(message);

        this.message = message;
        this.data = data;
    }
}

class Broadcast extends Schema {
    @type("string") messageType: messageType = messageTypes.broadcast;
    @type("string") from: string = "server";
    @type("string") message: string;

    constructor(message: string) {
        super(message);

        this.message = message;
    }
}

class Debug extends Schema {
    @type("string") messageType: messageType = messageTypes.debug;
    @type("string") from: string = "server";
    @type("string") message: string;

    constructor(message: string) {
        super(message);

        this.message = message;
    }
}
