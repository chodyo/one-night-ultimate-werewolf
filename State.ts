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
          let roleID = roleName + i;
          let role = new Role(
            roleID,
            roleName,
            roleDef.description,
            roleDef.prompt,
            roleDef.team,
            roleDef.wakeOrder
          );
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

    console.debug("Aquired state lock.");
    this.locked = true;
  }

  unlock() {
    if (!this.locked) {
      console.error(
        "Expected to unlock State.locked, but found it was already locked."
      );
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
      console.debug(
        "Activated minion with no werewolves. Also activating werewolf0."
      );

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

    let selectedRoleCount = Array.from(this.roles._indexes.keys()).filter(
      (roleID) => this.roles[roleID].active
    ).length;
    let playerCount = this.players._indexes.size;

    this.unlock();

    if (playerCount + 3 !== selectedRoleCount) {
      return `Playing with ${playerCount} player${
        playerCount === 1 ? "" : "s"
      } requires ${playerCount + 3} roles, but there ${
        selectedRoleCount === 1 ? "is" : "are"
      } only ${selectedRoleCount} role${
        selectedRoleCount === 1 ? "" : "s"
      } chosen.`;
    }
  }

  startNighttime(): Map<Player, string> {
    this.phase = "nighttime";

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
    const selectedRoleIDs = Array.from(this.roles._indexes.keys()).filter(
      (roleID) => this.roles[roleID].active
    );

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

    console.debug(
      `Finished assigning roles to players=${JSON.stringify(this.players)}`
    );

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
}

function getPartnerRoleID(roleID: string): string {
  console.debug(`Player=${roleID}`);

  const ID = parseInt(roleID.slice(-1));
  const otherID = ID ^ 1;
  const partnerID = roleID.replace(ID.toString(), otherID.toString());

  console.debug(`Partner=${partnerID}`);

  return partnerID;
}
