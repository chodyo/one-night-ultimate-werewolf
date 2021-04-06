import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { RoleName, Role, roleNames, roles } from "./Role";

export class Player extends Schema {
    @type("string")
    name: string = "";

    @type(Role)
    role: Role = new Role();

    @type("boolean")
    ready: boolean = false;

    @type("string")
    sessionId: string;

    constructor(sessionId: string) {
        super();

        this.sessionId = sessionId;
    }

    setName(name: string) {
        this.name = name;
    }

    setRole(role: Role) {
        this.role = role;
    }

    clearRole() {
        this.role = new Role();
    }
}
