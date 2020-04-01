import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import roles from "./static/assets/onenight.json";

type RoleID = keyof typeof roles;

const roleIDs = Object.keys(roles) as RoleID[];

class Role extends Schema {
    @type("string")
    name: RoleID;

    @type("boolean")
    active: boolean = false;

    @type("string")
    team: string = "";

    @type("number")
    wakeOrder: number;

    constructor(name?: RoleID, team?: string, wakeOrder?: number) {
        super();

        this.name = name || "villager";
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

// API
// data = {
//     command: string,
//     params: {
//         name: string, (setName),
//         roleID: string, (updateRole),
//         roleEnabled: boolean, (updateRole)
//     }
// }

export class MyRoom extends Room {
    // ====== Colyseus Properties ======

    maxClients = 10;

    // ====== Player Command Mapping ======

    commands = new Map([
        ["setName", this.updatePlayerName.bind(this)],
        ["updateSelectedRole", this.updateSelectedRole.bind(this)],
        ["startGame", this.startGame.bind(this)]
    ]);

    // ====== Player Commands ======

    updatePlayerName(client: Client, params: any) {
        const player = this.state.players[client.sessionId];
        let oldName = player.name;
        player.name = params.name;
        console.debug(`Updated player ${client.sessionId}'s name from "${oldName}" to "${player.name}"`);
    }

    updateSelectedRole(client: Client, params: any) {
        this.state.setRoleActive(params.roleID, params.roleEnabled);
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
