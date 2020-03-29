import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";

// Define the roles and the max number of occurrences of that role in a round.
const roleMaximum: Record<string, number> = {
    doppelganger: 1,
    drunk: 1,
    hunter: 1,
    insomniac: 1,
    mason: 2,
    minion: 1,
    robber: 1,
    seer: 1,
    tanner: 1,
    troublemaker: 1,
    villager: 3,
    werewolf: 2
};

type RoleID = keyof typeof roleMaximum;

const roleIDs = Object.keys(roleMaximum) as RoleID[];

class Role extends Schema {
    @type("string")
    name: RoleID = "";
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

    // The players select the roles that will be assigned to the players when the round starts.
    @type({ map: "string" })
    roleCount = new MapSchema<RoleID>();

    addPlayer(id: string) {
        this.players[id] = new Player();
    }

    removePlayer(id: string) {
        delete this.players[id];
    }

    initRoles() {
        for (let roleID in roleIDs) {
            this.roleCount.set(roleID, 0);
        }
    }

    addRole(roleID: RoleID) {
        let count = this.roleCount.get(roleID);
        if (count < roleMaximum[roleID]) {
            this.roleCount.set(roleID, count++);
        }
    }

    removeRole(roleID: RoleID) {
        let count = this.roleCount.get(roleID);
        if (count > 0) {
            this.roleCount.set(roleID, count--);
        }
    }
}

// API
// data = {
//     command: string,
//     params: {
//         name: string, (setName),
//         role: string, (updateRole),
//         roleAction: string, (updateRole) ["add", "remove"]
//     }
// }

export class MyRoom extends Room {
    // ====== Colyseus Properties ======

    maxClients = 10;

    // ====== Player Command Mapping ======

    commands = new Map([
        ["setName", this.updatePlayerName.bind(this)],
        ["updateRole", this.updateRole.bind(this)],
        ["startGame", this.startGame.bind(this)]
    ]);

    // ====== Player Commands ======

    updatePlayerName(client: Client, params: any) {
        const player = this.state.players[client.sessionId];
        let oldName = player.name;
        player.name = params.name;
        console.debug(`Updated player ${client.sessionId}'s name from "${oldName}" to "${player.name}"`);
    }

    updateRole(client: Client, params: any) {
        if (params.roleAction === "add") {
            this.state.addRole(params.role);
        } else {
            this.state.removeRole(params.role);
        }
    }

    startGame(client: Client, params: any) {}

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

        let invokeCommand = this.commands.get(data.command);
        if (invokeCommand) {
            invokeCommand(client, data.params);
        } else {
            console.log(`Command ${data.command} not defined.`);
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
