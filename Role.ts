import { Schema, type } from "@colyseus/schema";
import roles from "./static/assets/onenight.json";

// Enforces strict values for role names

export { roles };
export type RoleID = keyof typeof roles;
export const roleIDs = Object.keys(roles) as RoleID[];

export class Role extends Schema {
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
