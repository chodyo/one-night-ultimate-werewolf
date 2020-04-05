import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { Messager } from "./Message";
import { RoleName, Role, roleNames, roles } from "./Role";
import { CallbackFunction, emptyCallback, ActionFunction, actions, Action } from "./Action";

export class State extends Schema {
    // Utilized when the server needs to assign roles without the state receiving updates.
    private locked: boolean = false;

    // ====== Custom Properties ======

    private messager: Messager;

    // playerID => roleID
    playerRoles: { [index: string]: string } = {};

    // ====== Synched Properties ======

    // The players that are participating in the round.
    @type({ map: Player })
    players = new MapSchema<Player>();

    // All possible roles that can be in the game.
    @type({ map: Role })
    roles = new MapSchema<Role>();

    @type("string")
    phase = "daytime";

    constructor(messager: Messager) {
        super();

        this.messager = messager;

        this.initRoles();
    }

    initRoles() {
        if (!this.locked) {
            roleNames.forEach((roleName) => {
                let roleDef = roles[roleName];

                for (let i = 0; i < roleDef.maximum; i++) {
                    let roleKey = roleName + i;
                    let role = new Role(roleName, roleDef.team, roleDef.wakeOrder);
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

        console.debug("Aquired state lock.");
        this.locked = true;
    }

    unlock() {
        if (!this.locked) {
            console.error("Expected to unlock State.locked, but found it was already locked.");
        }

        console.debug("Freed state lock.");
        this.locked = false;
    }

    addPlayer(client: Client) {
        this.lock();

        this.players[client.sessionId] = new Player(client);

        this.unlock();
    }

    removePlayer(id: string) {
        this.lock();

        delete this.players[id];

        this.unlock();
    }

    updatePlayerName(id: string, newName: string): CallbackFunction[] {
        const player = this.players[id];
        if (!player) {
            console.error(`Invalid player=${id}`);
            return [];
        }

        let oldName = player.name;
        player.name = newName;

        let msg = `Updated player ${id}'s name from "${oldName}" to "${player.name}"`;
        console.debug(msg);
        this.messager.Broadcast(msg);

        return [];
    }

    setRoleActive(roleID: string, active: boolean) {
        this.lock();

        let role = this.roles[roleID];
        if (!role) {
            console.error(`Invalid roleID=${roleID}`);
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
            this.roles["mason" + otherMason].active = active;

            console.debug(`Toggled ${roleID}; also toggled mason${otherMason}.`);
        }

        this.unlock();
    }

    checkRoleSelectionCount(): string | undefined {
        this.lock();

        let selectedRoleCount = Array.from(this.roles._indexes.keys()).filter((roleID) => this.roles[roleID].active)
            .length;
        let playerCount = this.players._indexes.size;
        // for (let roleID in this.roles) {
        //     if (this.roles[roleID].active) {
        //         selectedRoleCount++;
        //     }
        // }
        // let playerCount = 0;
        // for (let _ in this.players) {
        //     playerCount++;
        // }

        this.unlock();

        if (playerCount + 3 !== selectedRoleCount) {
            return `Playing with ${playerCount} player${playerCount === 1 ? "" : "s"} requires ${
                playerCount + 3
            } roles, but there ${selectedRoleCount === 1 ? "is" : "are"} only ${selectedRoleCount} role${
                selectedRoleCount === 1 ? "" : "s"
            } chosen.`;
        }
    }

    distributeRoles() {
        if (Object.keys(this.playerRoles).length > 0) {
            console.error("Roles have already been distributed", this.playerRoles);
            return;
        }

        this.lock();

        let playerIDs = Array.from(this.players._indexes.keys());
        let selectedRoleIDs = Array.from(this.roles._indexes.keys()).filter((roleID) => this.roles[roleID].active);

        console.debug(`players=${playerIDs} selectedRoles=${selectedRoleIDs}`);

        playerIDs.forEach((playerID: string) => {
            let i = Math.floor(Math.random() * selectedRoleIDs.length);
            let randomRole = selectedRoleIDs.splice(i, 1)[0]; // deletes "1" element in place at index i and returns the value

            this.playerRoles[playerID] = randomRole;
        });

        // there should be 3 remaining roles that go in the center
        selectedRoleIDs.forEach((role: string, i: number) => {
            this.playerRoles["center" + i] = role;
        });

        console.debug(`Finished assigning playerRoles=${JSON.stringify(this.playerRoles)}`);

        this.unlock();
    }

    startNighttime() {
        this.phase = "nighttime";
    }
}

export class MyRoom extends Room {
    // ====== Colyseus Properties ======

    maxClients = 10;

    // ====== Custom Properties ======

    private messager = new Messager(this);

    // ====== Player Action Mapping ======

    actionExecs = new Map<Action, ActionFunction>([
        [actions.setPlayerName, this.setPlayerName],
        [actions.updateSelectedRole, this.updateSelectedRole],
        [actions.startGame, this.startGame],
    ]);

    // ====== Player Actions ======

    setPlayerName(client: Client, params: any): CallbackFunction[] {
        this.state.updatePlayerName(client.sessionId, params.name);
        return [emptyCallback];
    }

    updateSelectedRole(client: Client, params: any): CallbackFunction[] {
        this.state.setRoleActive(params.roleID, params.roleEnabled);
        return [emptyCallback];
    }

    startGame(client: Client, params: any): CallbackFunction[] {
        let err = this.state.checkRoleSelectionCount();
        if (err) {
            console.error(err);
            this.messager.Notify(client, err);
            return [emptyCallback];
        }

        // close the room to new players
        this.lock();

        this.state.distributeRoles();
        this.state.startNighttime();

        // message players
        for (let playerID in this.state.playerRoles) {
            if (!this.state.playerRoles.hasOwnProperty(playerID) || playerID.startsWith("center")) {
                continue;
            }

            const player = this.state.players[playerID];
            const roleID = this.state.playerRoles[playerID];
            const role = this.state.roles[roleID];
            const msg = role.getNighttimeMessage(roleID, this.state.players, this.state.roles, this.state.playerRoles);
            console.debug(`Notifying ${playerID} of their role assignment ${roleID} with custom message ${msg}`);
            this.messager.Notify(player.client, msg, roleID);
        }

        // placeholder, this func will end up returning a bunch of callback functions from each role assignment
        return [emptyCallback];
    }

    // ====== Colyseus Handlers ======

    onCreate(options: any) {
        console.debug("MyRoom created!", options);
        this.setState(new State(this.messager));
    }

    onJoin(client: Client, options: any) {
        console.debug(`Player ${client.sessionId} joined.`);
        this.state.addPlayer(client);
    }

    onMessage(client: Client, data: any) {
        console.debug("MyRoom received message from", client.sessionId, ":", data);

        let exec = this.actionExecs.get(data.action);
        if (exec) {
            exec.bind(this)(client, data.params, this).forEach((callback) => {
                callback(client, data, this);
            });
        } else {
            let msg = `Action ${data.action} not defined.`;
            console.error(msg);
            this.messager.Debug(client, msg);
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
