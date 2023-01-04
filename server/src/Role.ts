import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";
import roles from "./static/assets/onenight.json";

// Enforces strict values for role names

export { roles };
export type RoleName = keyof typeof roles;
export const roleNames = Object.keys(roles) as RoleName[];

export class Role extends Schema {
    @type("string")
    roleID?: string;

    @type("string")
    name?: RoleName;

    @type("boolean")
    active: boolean = false;

    @type("string")
    team?: string;

    @type("number")
    wakeOrder?: number;

    @type("boolean")
    doppelganger: boolean = false;

    @type("boolean")
    doppelswapped: boolean = false;

    constructor(roleID?: string, name?: RoleName, team?: string, wakeOrder?: number) {
        super();

        this.roleID = roleID;
        this.name = name;
        this.team = team;
        this.wakeOrder = wakeOrder;
    }
}
