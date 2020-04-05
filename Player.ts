import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { RoleName, Role, roleNames, roles } from "./Role";

export class Player extends Schema {
    @type("string")
    name: string = "";

    @type(Role)
    role: Role = new Role();

    client: Client;

    constructor(client: Client) {
        super();

        this.client = client;
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
