import { Room, Client } from "colyseus";
import { Messager } from "./Message";
import { ActionFunction, actions, Action } from "./Action";
import { State } from "./State";
import { Player } from "./Player";

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

    setPlayerName(client: Client, params: any): void {
        this.state.updatePlayerName(client.sessionId, params.name);
    }

    updateSelectedRole(client: Client, params: any): void {
        this.state.setRoleActive(params.roleID, params.roleEnabled);
    }

    startGame(client: Client, params: any): void {
        let err = this.state.checkRoleSelectionCount();
        if (err) {
            console.error(err);
            this.messager.Notify(client, err);
        }

        // close the room to new players
        this.lock();

        const messages: Map<Player, string> = this.state.startNighttime();

        // message players
        messages.forEach((message: string, player: Player) => {
            const roleID = player.role.roleID;
            console.debug(
                `Notifying ${player.client.sessionId} of their role assignment ${roleID} with custom message "${message}"`
            );
            this.messager.Notify(player.client, message, roleID);
        });
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
            exec.bind(this)(client, data.params, this);
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
