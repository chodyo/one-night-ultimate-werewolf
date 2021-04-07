import { Schema, MapSchema, type } from "@colyseus/schema";
import { Messager } from "./Message";
import { Player } from "./Player";
import { Role, roleNames, roles } from "./Role";

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
     * prep: Players are joining and choosing the roles that will be active in the round.
     * doppelganger: An optional phase when the doppelganger is in the game, which allows the doppelganger to choose their role. Other players will see a "loading moon phases" message. 
     *      If the timer runs out a random selection will be made so play can continue. 
     *      If the doppelganger is a non-player (in the center) then players will see a "loading moon phases" for a random amount of time (in between 5-10 seconds) so as not to give away that the doppelganger is in the center.
     * nighttime: Werewolf, minion, and mason players find out who their teammates are. 
     *      Action roles can submit their action.
     * daytime: Players who were woken to perform a night action will receive messages about nighttime choices and/or results, 
     *      such as robber and insomniac learning their new role. 
     *  TODO: Add discussionTime
     * discussiontime: Players discuss amongst themselves who they believe the werewolves are and can lock or unlock their votes for their choice of player.
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

    addPlayer(sessionId: string) {
        this.lock();

        this.players[sessionId] = new Player(sessionId);

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

    doppelgangerIsActive(): Boolean {
        return (
            Array.from(this.players._indexes.keys()).filter((playerID) => this.players[playerID].role.name === "doppelganger").length === 1
        );
    }

    allAreReady(): boolean {
        return (
            Array.from(this.players._indexes.keys()).filter((playerID) => !this.players[playerID].ready).length === 0
        );
    }

    private clearAllReady() {
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

    startPhase(phase: string): Map<Player, string> {
        this.phase = phase;

        this.clearAllReady();

        let phaseMessaging = (playerID: string): string => { return "" };
        switch (phase) {
            case "doppelganger":
                this.distributeRoles();
            // fall through to distribute roles for now
            case "nighttime":
                phaseMessaging = (playerID: string): string => this.nighttimeMessage(playerID);
                break;
            case "daytime":
                this.executeNightActions();
                phaseMessaging = (playerID: string): string => this.daytimeMessage(playerID);
                break;
        }

        return this.getPlayerMessages(phaseMessaging);
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

        console.debug(`Finished assigning roles to players=${JSON.stringify(this.players, null, 2)}`);

        this.unlock();
    }

    distributeDoppelsRole(clientID: string, chosenPlayersClientID: string) {

        this.lock();

        const doppelsRoleWakeOrder = 1;
        //Get the Doppelganger's choice to prepare for new role assignment
        const doppelgangedRole = this.players[chosenPlayersClientID].role;

        let roleID = getPartnerRoleID(doppelgangedRole.roleID);
        let newRole = new Role(
            roleID,
            doppelgangedRole.name,
            doppelgangedRole.team,
            doppelsRoleWakeOrder
        );
        newRole.doppelganger = true;

        //The role assignment
        const player = this.players[clientID];

        player.role = newRole;
        console.debug('Setting role for doppelganger');
        this.rolePlayers.set(newRole, player);

        this.unlock();
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

        this.nightChoices.set(player, choice);

        // TODO: only for debugging purposes, maybe remove once functional
        let msg = `Set player ${id}'s choice of "${JSON.stringify(choice)}" for the "${roleName} action."`;
        console.debug(msg);
        this.messager.Broadcast(msg);
    }

    private executeNightActions() {
        this.lock();

        const nightChoices = this.sortByWakeOrder(this.nightChoices);

        console.debug(`roleChoices are ${JSON.stringify([...nightChoices], null, 2)}`);

        nightChoices.forEach((choices: Array<string>, player: Player) => {
            let role = player.role;
            switch (role.name) {
                case "robber":
                    if (choices.length === 1) {
                        console.debug("Executing Robber night choice...");
                        const robbedPlayer = this.players[choices[0]];
                        const robbedRole = this.getLatestPlayerRole(choices[0]);
                        const currentRole = this.getLatestPlayerRole(player.sessionId);

                        this.finalResults.set(player, robbedRole);
                        this.finalResults.set(robbedPlayer, currentRole);

                        console.debug(`${player.name} robbed into ${robbedRole.roleID}`);
                        console.debug(`${robbedPlayer.name} is now ${currentRole.roleID}`);
                    }
                    break;
                case "troublemaker":
                    if (choices.length === 2) {
                        console.debug("Executing Troublemaker night choices...");
                        const playerA = this.players[choices[0]];
                        const playerB = this.players[choices[1]];

                        const roleA = this.getLatestPlayerRole(playerA.sessionId);
                        const roleB = this.getLatestPlayerRole(playerB.sessionId);

                        this.finalResults.set(playerA, roleB);
                        this.finalResults.set(playerB, roleA);

                        console.debug(`${playerA.name}'s role was ${roleA.name} and is now ${roleB.name}`);
                        console.debug(`${playerB.name}'s role was ${roleB.name} and is now ${roleA.name}`);
                    }
                    break;
                case "drunk":
                    console.debug("Executing Drunk night choice...");
                    if (choices.length === 1) {
                        const drunkedRole = this.centerRoles.get(choices[0])!;
                        
                        //set the center card choice to players current role
                        this.centerRoles.set(choices[0], this.getLatestPlayerRole(player.sessionId));

                        this.finalResults.set(player, drunkedRole);
                        console.debug(`${player.name} drunked into ${drunkedRole.name}`);

                    } else {
                        console.error("The drunk died by execution!!")
                    }
                    break;
            }
        });

        [...this.rolePlayers.values()].forEach((player) => {
            const playerHasNoResult = [...this.finalResults.keys()].filter((playerWithResult) => playerWithResult === player).length === 0;
            if (playerHasNoResult) {
                console.info(`${player.name}'s role is unchanged and remains ${player.role.name}`);
                this.finalResults.set(player, player.role)
            }
        });

        console.debug(`Finished setting finalResults=${JSON.stringify([...this.finalResults], null, 2)}`);

        this.unlock();
    }

    private nighttimeMessage(playerID: string): string {
        const player = this.players[playerID];
        const role = player.role;
        console.debug(`roleID=${JSON.stringify(role)}`);

        switch (role.name) {
            case "werewolf":
            case "mason":
                return this.getPartnerNames(role.ID, role.name);
            case "doppelganger":
                return `You are the${this.getLatestPlayerRole(playerID).roleID}`;
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
            default:
                return "";
        }
    }

    private daytimeMessage(playerID: string): string {
        const player = this.players[playerID];
        //Should there be a daytime Message for drunk, i.e. "You drank into center1"
        const role = player.role;

        console.debug(`${player.name}'s role ${JSON.stringify(role, null, 2)}`)

        const noRoleActionMessage = `You chose not to perform your ${role.name} action.`;
        switch (role.name) {
            case "werewolf":
                const isLonewolf = [...this.rolePlayers].filter(([role, _]) => role.name === "werewolf").length === 1;
                if (isLonewolf) {
                    const lonewolfChoice = this.findPlayer<string[]>(playerID, this.nightChoices);
                    if (lonewolfChoice.length === 1) {
                        return `The ${lonewolfChoice[0]} card is ${this.centerRoles.get(lonewolfChoice[0])!.name}.`;
                    } else return noRoleActionMessage;
                } else return "";
            case "seer":
                const seerChoices = this.findPlayer<string[]>(playerID, this.nightChoices);
                if (seerChoices.length === 1) {
                    let chosenPlayer = this.players[seerChoices[0]];
                    //if("doppel-drunk" or "doppel-robber"){OGseer should see drunkedRole or RobbedRole}
                    const seeredRole = chosenPlayer.role.doppelganger ? this.getLatestPlayerRole(seerChoices[0]) : chosenPlayer.role
                    const chosenPlayerRoleName = seeredRole.doppelganger ? "doppelganger" : seeredRole.name;
                    return `${chosenPlayer.name} is a ${chosenPlayerRoleName}`;
                } else if (seerChoices.length === 2) {
                    const card1 = this.centerRoles.get(seerChoices[0])!;
                    const card2 = this.centerRoles.get(seerChoices[1])!;
                    return `The ${seerChoices.join(", ")} cards are ${card1.name} and ${card2.name} respectively.`;
                } else return noRoleActionMessage;
            case "robber":
                const robberChoice = this.findPlayer<string[]>(playerID, this.nightChoices);
                if (robberChoice.length === 1) {
                    const robbedRole = role.doppelganger ? this.players[robberChoice[0]].role : this.getLatestPlayerRole(playerID);
                    const robbedRoleName = robbedRole.doppelganger ? "doppelganger" : robbedRole.name;
                    return `Your new role is ${robbedRoleName}`;
                } else return noRoleActionMessage;
            case "troublemaker":
                const troublemakerChoice = this.findPlayer<string[]>(playerID, this.nightChoices);
                if (troublemakerChoice.length === 2) {
                    const playerA = this.players[troublemakerChoice[0]];
                    const playerB = this.players[troublemakerChoice[1]];
                    return `You switched ${playerA.name}'s and ${playerB.name}'s roles`;
                } else return noRoleActionMessage;
            case "insomniac":
                const wakingRole = this.findPlayer<Role>(playerID, this.finalResults);
                const wakingRoleName = wakingRole.doppelganger ? "doppelganger" : wakingRole.name;
                return `You woke up as a ${wakingRoleName}.`;
            default:
                return "";
        }
    }

    // TODO: Look into using this for client roles
    private sortByWakeOrder(nightChoices: Map<Player, string[]>): Map<Player, string[]> {
        return new Map([...nightChoices.entries()].sort(([roleA, choicesA], [roleB, choicesB]) => {
            let a = roleA.role.wakeOrder!;
            let b = roleB.role.wakeOrder!;

            if (a === -1 && b === -1) return 0;
            else if (a === -1) return 1;
            else if (b === -1) return -1;

            if (a === b) return 0;
            else if (a > b) return 1;
            else return -1;
        }));
    }

    private getPlayerMessages(phaseMessaging: (id: string) => string): Map<Player, string> {
        const messages = new Map();
        [...this.players._indexes].forEach(([playerID, _]) => {
            const player = this.players[playerID];
            const message = phaseMessaging(playerID);
            messages.set(player, message);
        });

        return messages;
    }

    private getLatestPlayerRole(playerID: string): Role {
        const changedRole = [...this.finalResults.entries()].filter(([player, T]) => player.sessionId === playerID)[0];
        return changedRole !== undefined && changedRole.length > 0 ? changedRole[1] : this.players[playerID].role;
    }

    getPartnerNames(clientID: string, roleName: string): string {

        const partnerNames = Array.from(this.rolePlayers)
            .filter(([partnersRole, _]) => partnersRole.name === roleName)
            .map(([_, player]) => player.name);

        if (partnerNames.length == 0) {
            return `You are the only ${roleName}.`;
        } else if (partnerNames.length == 1) {
            return `You are the only ${roleName}.`;
        } else {
            const pluralRoleName = roleName === "werewolf" ? 'werewolves' : 'minions'
            return `The ${pluralRoleName} are ${partnerNames}.`;
        }
    }

    private findPlayer<T>(playerID: string, playerMap: Map<Player, T>): T {
        return [...playerMap.entries()].filter(([player, T]) => player.sessionId === playerID)[0][1];
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
