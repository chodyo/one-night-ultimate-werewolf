import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import * as Messages from "./Message";
import { RoleID, Role, roleIDs, roles } from "./Role";
import { CallbackFunction, emptyCallback, ActionFunction, actions, Action } from "./Action";

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
    // Utilized when the server needs to assign roles without the state receiving updates.
    private locked: boolean = false;

    // The players that are participating in the round.
    @type({ map: Player })
    players = new MapSchema<Player>();

    // All possible roles that can be in the game.
    @type({ map: Role })
    roles = new MapSchema<RoleID>();

    // playerID => roleID
    playerRoles: { [index: string]: string } = {};

    constructor() {
        super();

        this.initRoles();
    }

    initRoles() {
        if (!this.locked) {
            roleIDs.forEach((roleID) => {
                let roleDef = roles[roleID];

                for (let i = 0; i < roleDef.maximum; i++) {
                    let roleKey = roleID + i;
                    let role = new Role(roleID, roleDef.team, roleDef.wakeOrder);
                    this.roles[roleKey] = role;
                }
            });
        }
    }

    lock() {
        // sleep would be better here but javascript doesn't support sleeps outside of async/await and promises
        while (this.locked) {
            console.debug("Waiting to unlock the state.");
        }

        this.locked = true;
    }

    unlock() {
        if (!this.locked) {
            console.error("Expected to unlock State.locked, but found it was already locked.");
        }

        this.locked = false;
    }

    addPlayer(id: string) {
        this.lock();

        this.players[id] = new Player();

        this.unlock();
    }

    removePlayer(id: string) {
        this.lock();

        delete this.players[id];

        this.unlock();
    }

    setRoleActive(roleID: string, active: boolean) {
        this.lock();

        let role = this.roles[roleID];
        if (!role) {
            console.warn(`Invalid roleID=${roleID}`);
            return;
        }

        role.active = active;

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

        this.unlock();
    }

    distributeRoles() {
        if (Object.keys(this.playerRoles).length > 0) {
            console.error("Roles have already been distributed", this.playerRoles);
            return;
        }

        this.lock();

        let playerIDs = this.players.keys();
        let selectedRoles = this.roles.keys();

        console.debug(`players=${playerIDs} selectedRoles=${selectedRoles}`);

        playerIDs.forEach((playerID: string) => {
            let i = Math.floor(Math.random() * selectedRoles.length);
            let randomRole = selectedRoles.splice(i, 1); // deletes "1" element in place at index i and returns the value

            this.playerRoles[playerID] = randomRole;
        });

        this.unlock();
    }
}

export class MyRoom extends Room {
    // ====== Colyseus Properties ======

    maxClients = 10;

    // ====== Player Action Mapping ======

    actionExecs = new Map<Action, ActionFunction>([
        [actions.setPlayerName, this.setPlayerName],
        [actions.updateSelectedRole, this.updateSelectedRole],
        [actions.startGame, this.startGame],
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
                let msg = new Messages.Notification(`Name updated from "${oldName}" to "${params.name}".`);
                console.log("message", JSON.stringify(msg));
                room.send(client, msg);

                let broadcast = new Messages.Broadcast(`"${oldName}" has changed their name to "${params.name}".`);
                console.log("broadcast", JSON.stringify(broadcast));
                room.broadcast(broadcast);
            },
        ];
    }

    updateSelectedRole(client: Client, params: any): CallbackFunction[] {
        this.state.setRoleActive(params.roleID, params.roleEnabled);
        return [emptyCallback];
    }

    startGame(client: Client, params: any): CallbackFunction[] {
        let selectedRoleCount = this.state.getSelectedRoleCount();
        let playerCount = this.state.players.length;

        if (playerCount !== selectedRoleCount + 3) {
            console.log(
                `Player "${
                    this.state.players[client.sessionId].name
                }" attempted to start the game with ${selectedRoleCount} roles and ${playerCount} players.`
            );
            return [
                (client: Client, data: any, room: MyRoom) => {
                    room.send(
                        client,
                        new Messages.Message(`Playing with ${playerCount} players requires ${playerCount + 3} roles.`)
                    );
                },
            ];
        }

        this.state.distributeRoles();
        this.state.startNightTime();

        // placeholder, this func will end up returning a bunch of callback functions from each role assignment
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
            exec.bind(this)(client, data.params, this).forEach((callback) => {
                callback(client, data, this);
            });
        } else {
            let msg = `Action ${data.action} not defined.`;
            console.log(msg);
            this.send(client, new Messages.Debug(msg));
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
