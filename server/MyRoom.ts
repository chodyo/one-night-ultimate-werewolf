import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import roles from "./static/assets/onenight.json";

// Enforces strict values for role names

type RoleID = keyof typeof roles;

const roleIDs = Object.keys(roles) as RoleID[];

class Role extends Schema {
    @type("string")
    name?: RoleID;

    @type("boolean")
    active: boolean = false;

    @type("string")
    team: string = "";

    @type("number")
    wakeOrder: number;

    constructor(name?: RoleID, team?: string, wakeOrder?: number) {
        super();

        this.name = name || undefined;
        this.team = team || "";
        this.wakeOrder = wakeOrder || -1;
    }
}

class Player extends Schema {
    @type("string")
    name: string = "";

    @type(Role)
    role: Role = new Role();

    setName(name: string) {
        this.name = name;
    }
}

export class State extends Schema {
    // Represents the players that are participating in the round.
    @type({ map: Player })
    players = new MapSchema<Player>();

    // All possible roles that can be in the game.
    @type({ map: Role })
    roles = new MapSchema<RoleID>();

    constructor() {
        super();

        this.createRoleMapping();
    }

    createRoleMapping() {
        roleIDs.forEach(roleID => {
            let roleDef = roles[roleID];

            for (let i = 0; i < roleDef.maximum; i++) {
                let roleKey = roleID + i;
                let role = new Role(roleID, roleDef.team, roleDef.wakeOrder);
                this.roles[roleKey] = role;
            }
        });
    }

    addPlayer(id: string) {
        this.players[id] = new Player();
    }

    removePlayer(id: string) {
        delete this.players[id];
    }

    initRoles() {
        for (let roleID in roleIDs) {
            this.roles.set(roleID, 0);
        }
    }

    setRoleActive(roleID: RoleID, active: boolean) {
        this.roles[roleID].active = active;

        if (
            active &&
            roleID.startsWith("minion") &&
            !this.roles["werewolf0"].active &&
            !this.roles["werewolf1"].active
        ) {
            console.debug("Activated minion with no werewolves. Also activating werewolf0.");

            this.roles["werewolf0"].active = true;
        } else if (roleID.startsWith("mason")) {
            let otherMason = parseInt(roleID.slice(-1)) ^ 1;

            console.debug(`Toggled ${roleID}. Also toggling mason${otherMason}.`);

            this.roles["mason" + otherMason].active = active;
        }
    }
}

// Allows objects other than the Room to create callback functions that utilize Room actions

type CallbackFunction = (...args: any[]) => void;
const emptyCallback: CallbackFunction = function() {};

type ActionFunction = (client: Client, params: any, Room: MyRoom) => CallbackFunction[];

// Not required, just handy

enum actions {
    setPlayerName = "setPlayerName",
    updateSelectedRole = "updateSelectedRole",
    startGame = "startGame"
}
type Action = keyof typeof actions;

// Client => Server
// {
//     action: Action,
//     params: {
//         name: string, (setPlayerName),
//         roleID: string, (updateSelectedRole),
//         roleEnabled: boolean, (updateSelectedRole)
//     }
// }

// Server => Client
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
class Message extends Schema {
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
class PrivateMessage extends Message {
    @type("string") messageType: messageType = messageTypes.privateMessage;
    constructor(message: string) {
        super(message);
    }
}

/**
 * A game message from the server to a single client.
 */
class Notification extends Message {
    @type("string") messageType: messageType = messageTypes.notification;
    constructor(message: string) {
        super(message);
    }
}

/**
 * A game message from the server to all clients.
 */
class Broadcast extends Message {
    @type("string") messageType: messageType = messageTypes.broadcast;
    constructor(message: string) {
        super(message);
    }
}

/**
 * A non-game related message to a single client, used for debugging purposes only (for example, a bad request).
 */
class Debug extends Message {
    @type("string") messageType: messageType = messageTypes.debug;
    constructor(message: string) {
        super(message);
    }
}

export class MyRoom extends Room {
    // ====== Colyseus Properties ======

    maxClients = 10;

    // ====== Player Action Mapping ======

    actionExecs = new Map<Action, ActionFunction>([
        [actions.setPlayerName, this.setPlayerName],
        [actions.updateSelectedRole, this.updateSelectedRole],
        [actions.startGame, this.startGame]
    ]);

    // ====== Player Actions ======

    setPlayerName(client: Client, params: any): CallbackFunction[] {
        const player = this.state.players[client.sessionId];
        let oldName = player.name;
        player.name = params.name;
        console.debug(`Updated player ${client.sessionId}'s name from "${oldName}" to "${player.name}"`);

        // this is pretty unnecessary since the function has access to `this.send` directly. just using it as an example
        return [
            (client: Client, data: any, room: MyRoom) => {
                room.send(client, new Notification(`Name updated from "${oldName}" to "${params.name}".`));
                room.broadcast(new Broadcast(`"${oldName}" has changed their name to "${params.name}".`));
            }
        ];
    }

    updateSelectedRole(client: Client, params: any): CallbackFunction[] {
        this.state.setRoleActive(params.roleID, params.roleEnabled);
        return [emptyCallback];
    }

    startGame(client: Client, params: any): CallbackFunction[] {
        return [emptyCallback];
    }

    // ====== Colyseus Handlers ======

    onCreate(options: any) {
        console.log("MyRoom created!", options);
        this.setState(new State());
    }

    onJoin(client: Client, options: any) {
        console.log(`Player ${client.sessionId} joined.`);
        this.state.addPlayer(client.sessionId);
    }

    onMessage(client: Client, data: any) {
        console.log("MyRoom received message from", client.sessionId, ":", data);

        let exec = this.actionExecs.get(data.action);
        if (exec) {
            exec.bind(this)(client, data.params, this).forEach(callback => {
                callback(client, data, this);
            });
        } else {
            let msg = `Action ${data.action} not defined.`;
            console.log(msg);
            this.send(client, new Debug(msg));
        }
    }

    onLeave(client: Client, consented: boolean) {
        console.log(`Player ${client.sessionId} left.`);
        this.state.removePlayer(client.sessionId);
    }

    onDispose() {
        console.log("Dispose MyRoom.");
    }
}
