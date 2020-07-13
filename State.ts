import { Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Messager } from "./Message";
import { Player } from "./Player";
import { RoleName, Role, roleNames, roles } from "./Role";

export class State extends Schema {
    // Utilized when the server needs to assign roles without the state receiving updates.
    private locked: boolean = false;

    // ====== Custom Properties ======

    private messager: Messager;

    // role => player (player => role can be accessed directly on the Player obj)
    rolePlayers: Map<Role, Player> = new Map();

    // center# => role
    centerRoles: Map<string, Role> = new Map();

    private nightChoices: Map<Player, Array<string>> = new Map();

    private finalResults: Map<Player, Role> = new Map();

    // ====== Synched Properties ======

    // The players that are participating in the round.
    @type({ map: Player })
    players = new MapSchema<Player>();

    // All possible roles that can be in the game.
    @type({ map: Role })
    roles = new MapSchema<Role>();

    /**
     * Phases:
     * prep -> [doppelganger] -> nighttime -> daytime -> results
     *
     * Most phases move to the next phase after a timer runs out, or the game can move to the next phase early if all players mark ready or finish actions.
     *
     * prep: Players are joining and choosing the roles that will participate in the round.
     * doppelganger: An optional phase when the doppelganger is in the game, which allows the doppelganger to choose their role.
     * nighttime: Werewolf, minion, and mason players find out who their teammates are. Action roles can submit their action.
     * daytime: Some players receive additional messages about nighttime results, such as robber and insomniac learning their new role. Players begin discussing who the werewolves are and can lock or unlock their votes.
     * results: All votes are in, the roles are revealed and the winner is displayed. (This could possibly be the same screen as the "prep" phase, allowing new roles to be selected for the next game.)
     */
    @type("string")
    phase = "prep";

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
                    let roleID = roleName + i;
                    let role = new Role(roleID, roleName, roleDef.team, roleDef.wakeOrder);
                    this.roles[roleID] = role;
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

    updatePlayerName(id: string, newName: string): void {
        const player = this.players[id];
        if (!player) {
            console.error(`Invalid player=${id}`);
            return;
        }

        let oldName = player.name;
        player.name = newName;

        let msg = `Updated player ${id}'s name from "${oldName}" to "${player.name}"`;
        console.debug(msg);
        this.messager.Broadcast(msg);
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

        this.clearAllReady();

        this.unlock();
    }

    ready(playerID: string) {
        this.players[playerID].ready = true;
    }

    allAreReady(): boolean {
        return (
            Array.from(this.players._indexes.keys()).filter((playerID) => !this.players[playerID].ready).length === 0
        );
    }

    clearAllReady() {
        Array.from(this.players._indexes.keys()).forEach((playerID) => (this.players[playerID].ready = false));
    }

    checkRoleSelectionCount(): string | undefined {
        this.lock();

        let selectedRoleCount = Array.from(this.roles._indexes.keys()).filter((roleID) => this.roles[roleID].active)
            .length;
        let playerCount = this.players._indexes.size;

        this.unlock();

        if (playerCount + 3 !== selectedRoleCount) {
            return `Playing with ${playerCount} player${playerCount === 1 ? "" : "s"} requires ${
                playerCount + 3
            } roles, but there ${selectedRoleCount === 1 ? "is" : "are"} only ${selectedRoleCount} role${
                selectedRoleCount === 1 ? "" : "s"
            } chosen.`;
        }
    }

    startNighttime(): Map<Player, string> {
        this.phase = "nighttime";

        this.clearAllReady();

        this.distributeRoles();

        const messages = new Map();
        Array.from(this.players._indexes).forEach(([playerID, _]) => {
            const player = this.players[playerID];
            const message = this.getNighttimeMessage(player.role.roleID);
            messages.set(player, message);
        });

        return messages;
    }

    distributeRoles() {
        if (this.rolePlayers.size > 0) {
            console.error("Roles have already been distributed", this.rolePlayers);
            return;
        }

        this.lock();

        const playerIDs = Array.from(this.players._indexes.keys());
        const selectedRoleIDs = Array.from(this.roles._indexes.keys()).filter((roleID) => this.roles[roleID].active);

        console.debug(`players=${playerIDs} selectedRoles=${selectedRoleIDs}`);

        playerIDs.forEach((playerID: string) => {
            const i = Math.floor(Math.random() * selectedRoleIDs.length);
            const randomRoleID = selectedRoleIDs.splice(i, 1)[0]; // deletes "1" element in place at index i and returns the value

            const player = this.players[playerID];
            const role = this.roles[randomRoleID];

            player.role = role;
            this.rolePlayers.set(role, player);
        });

        // there should be 3 remaining roles that go in the center
        selectedRoleIDs.forEach((roleID: string, i: number) => {
            this.centerRoles.set("center" + i, this.roles[roleID]);
        });

        console.debug(`Finished assigning roles to players=${JSON.stringify(this.players)}`);

        this.unlock();
    }

    getNighttimeMessage(roleID: string): string {
        const role = this.roles[roleID];
        console.debug(`roleID=${JSON.stringify(role)}`);

        switch (role.name) {
            case "werewolf":
            case "mason":
                const partnerRoleID = getPartnerRoleID(roleID);
                const partnerRole = this.roles[partnerRoleID];
                if (!partnerRole.active) {
                    return `You are the only ${role.name}.`;
                }

                const partner = this.rolePlayers.get(partnerRole);
                return partner
                    ? `The other ${role.name} is ${partner.name}.`
                    : `The other ${role.name} is in the center.`;

            case "doppelganger":
                return "TODO";

            case "minion":
                const werewolfNames = Array.from(this.rolePlayers)
                    .filter(([role, _]) => role.name === "werewolf")
                    .map(([_, player]) => player.name);
                if (werewolfNames.length == 0) {
                    return `There are no werewolves.`;
                } else if (werewolfNames.length == 1) {
                    return `The werewolf is ${werewolfNames[0]}.`;
                } else {
                    return `The werewolves are ${werewolfNames}.`;
                }

            // case "drunk":
            // case "hunter":
            // case "insomniac":
            // case "robber":
            // case "seer":
            // case "tanner":
            // case "troublemaker":
            // case "villager":
            default:
                return "";
        }
    }

    setNightChoices(id: string, selectedCards: Array<string>, selectedPlayers: Array<string>): void {
        const player = this.players[id];
        if (!player) {
            console.error(`Invalid player=${id}`);
            return;
        }

        const roleName = player.role.name;

        let choice = Array<string>();
        switch (roleName) {
            case "werewolf":
                choice = selectedCards;
                break;
            case "seer":
                choice = selectedCards.length > 0 ? selectedCards : selectedPlayers;
                break;
            case "robber":
                choice = selectedPlayers;
                break;
            case "troublemaker":
                choice = selectedPlayers;
                break;
            case "drunk":
                choice = selectedCards;
                break;
            default:
                return;
        }

        if (choice.length > 0) {
            this.nightChoices.set(player, choice);
        }

        // TODO: only for debugging purposes, maybe remove once functional
        let msg = `Set player ${id}'s choice of "${JSON.stringify(choice)}" for the "${roleName} action."`;
        console.debug(msg);
        this.messager.Broadcast(msg);
    }

    // TODO: generalize into startPhase() with actions performed and message retrieved by phase argument
    startDaytime(): Map<Player, string> {
        this.phase = "daytime";

        this.clearAllReady();

        try {
            this.executeNightActions();

            const messages = new Map();
            Array.from(this.players._indexes).forEach(([playerID, _]) => {
                const player = this.players[playerID];
                const message = this.getDaytimeMessage(playerID, player.role.roleID);
                messages.set(player, message);
            });

            return messages;
        } catch (e) {
            console.error(`Fucked in exection by:`, e);
            this.unlock();
            return new Map();
        }
    }

    executeNightActions() {
        if (this.finalResults.size > 0) {
            console.error("Results have already been distributed", this.finalResults);
            return;
        }

        this.lock();

        const roleChoices = new Map(Array.from(this.nightChoices.entries()).sort(([roleA, choicesA], [roleB, choicesB]) => {
            console.info(`Role A is ${JSON.stringify(roleA)}\nRole B is ${JSON.stringify(roleB)}`);
            let a = roleA.role.wakeOrder!;
            let b = roleB.role.wakeOrder!;

            if (a === -1 && b === -1) return 0;
            else if (a === -1) return 1;
            else if (b === -1) return -1;

            if (a === b) return 0;
            else if (a > b) return 1;
            else return -1;
        }));

        console.debug(`roleChoices=${roleChoices}`);

        roleChoices.forEach((choices: Array<string>, player: Player) => {
            let role = player.role;
            switch (role.name) {
                case "robber":
                    if (choices.length === 1) {
                        const robbedPlayer = this.players[choices[0]];

                        this.finalResults.set(player, robbedPlayer.role);
                        this.finalResults.set(robbedPlayer, role);
                    }
                    break;
                case "troublemaker":
                    if (choices.length === 2) {
                        const playerA = this.players[choices[0]];
                        const playerB = this.players[choices[1]];

                        this.finalResults.set(playerA, playerB.role);
                        this.finalResults.set(playerB, playerA.role);
                    }
                    break;
                case "drunk":
                    if (choices.length === 1) {
                        this.finalResults.set(player, this.centerRoles.get(choices[0])!);
                    } else {
                        console.error("The drunk died by execution!!")
                    }
                    break;
            }
        });

        Array.from(this.rolePlayers.values()).forEach((player) => {
            const playerHasNoResult = Array.from(this.finalResults.keys()).filter((playerWithResult) => playerWithResult === player).length === 0;
            if (playerHasNoResult) {
                this.finalResults.set(player, player.role)
            }
        });

        console.debug(`Finished setting results to dayResults=${this.finalResults}`);

        this.unlock();
    }

    getDaytimeMessage(playerID: string, roleID: string): string {
        const role = this.roles[roleID];
        console.debug(`roleID=${JSON.stringify(role)}`);

        const youAreBlind = "You are blind!";

        const choices = Array.from(this.nightChoices.entries()).filter(([player, _]) => player.client.sessionId === playerID)[0][1];
        switch (role.name) {
            case "werewolf":
                const partnerRoleID = getPartnerRoleID(roleID);
                const partnerRole = this.roles[partnerRoleID];
                // As long as it's the lone wolf
                if (!partnerRole.active && choices.length === 1) {
                    return `The ${choices[0]} card is a ${this.centerRoles.get(choices[0])!.name}`;
                } else {
                    return youAreBlind;
                }
            case "seer":
                if (choices.length === 1) {
                    let chosenPlayer = this.players[choices[0]];
                    return `${chosenPlayer.name} is a ${chosenPlayer.role.name}`;
                } else if (choices.length === 2) {
                    const card1 = this.centerRoles.get(choices[0])!;
                    const card2 = this.centerRoles.get(choices[1])!;
                    return `The ${JSON.stringify(choices)} cards are a ${card1.name} and ${card2.name} respectively`;
                } else {
                    return youAreBlind;
                }
            case "robber":
                if (choices.length === 1) {
                    const robbedRole = this.players[choices[0]];
                    return `Your new role is ${robbedRole.name}`;
                } else {
                    return youAreBlind;
                }
            case "insomniac":
                const wakingRole = Array.from(this.finalResults.entries()).filter(([player, _]) => player.client.sessionId = playerID)[0][1];
                return `You woke up as a ${wakingRole.name}`;
            default:
                return "";
        }
    }
}

function getPartnerRoleID(roleID: string): string {
    console.debug(`Player=${roleID}`);

    const ID = parseInt(roleID.slice(-1));
    const otherID = ID ^ 1;
    const partnerID = roleID.replace(ID.toString(), otherID.toString());

    console.debug(`Partner=${partnerID}`);

    return partnerID;
}
