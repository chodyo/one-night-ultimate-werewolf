import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";
import roles from "./static/assets/onenight.json";

// Enforces strict values for role names

export { roles };
export type RoleName = keyof typeof roles;
export const roleNames = Object.keys(roles) as RoleName[];

export class Role extends Schema {
    @type("string")
    name?: RoleName;

    @type("boolean")
    active: boolean = false;

    @type("string")
    team: string = "";

    @type("number")
    wakeOrder: number;

    constructor(name?: RoleName, team?: string, wakeOrder?: number) {
        super();

        this.name = name || undefined;
        this.team = team || "";
        this.wakeOrder = wakeOrder || -1;
    }

    getNighttimeMessage(
        roleID: string,
        players: MapSchema<Player>,
        roles: MapSchema<Role>,
        playerRoles: { [index: string]: string }
    ) {
        const role = roles[roleID];
        console.debug(`roleID=${JSON.stringify(role)}`);

        switch (role.name) {
            case "werewolf":
            case "mason":
                const partnerRoleID = this.getPartnerRoleID(roleID);
                for (let playerID in playerRoles) {
                    if (playerRoles[playerID] === partnerRoleID) {
                        const partner = players[playerID];
                        return partner
                            ? `The other ${role.name} is ${partner.name}.`
                            : `The other ${role.name} is in the center.`;
                    }
                }
                return `You are the only ${role.name}.`;
            case "doppelganger":
                return "TODO";
            case "drunk":
            case "hunter":
            case "insomniac":
            case "robber":
            case "seer":
            case "tanner":
            case "troublemaker":
            case "villager":
                return "";
            case "minion":
                const werewolves: string[] = [];
                for (let playerID in playerRoles) {
                    if (playerID.startsWith("center")) {
                        continue;
                    }
                    if (playerRoles[playerID].startsWith("werewolf")) {
                        console.debug(`Adding ${playerID} to the list of werewolves.`);
                        werewolves.push(players[playerID].name);
                    }
                }
                if (werewolves.length == 0) {
                    return `There are no werewolves.`;
                } else if (werewolves.length == 1) {
                    return `The werewolf is ${werewolves[0]}.`;
                } else {
                    return `The werewolves are ${werewolves}.`;
                }
        }
        return "switch failed!!!!!!!!!!!";
    }

    getPartnerRoleID(roleID: string): string {
        console.debug(`Player=${roleID}`);
        const ID = parseInt(roleID.slice(-1));
        const otherID = ID ^ 1;
        const partnerID = roleID.replace(ID.toString(), otherID.toString());
        console.debug(`Partner=${partnerID}`);
        return partnerID;
    }
}
