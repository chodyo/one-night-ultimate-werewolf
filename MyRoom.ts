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
        [actions.ready, this.ready],
    ]);

    // ====== Player Actions ======

    setPlayerName(client: Client, params: any): void {
        this.state.updatePlayerName(client.sessionId, params.name);
    }

    updateSelectedRole(client: Client, params: any): void {
        this.state.setRoleActive(params.roleID, params.roleEnabled);
    }

    ready(client: Client, params: any): void {
        // Useful for dev-testing scenarios with multiple browser tabs, but could be used in game configuration ¯\_(ツ)_/¯
        if (params.readyAll) {
            Array.from(this.state.players._indexes.keys()).forEach((playerID) => (this.state.ready(playerID)))
        } else {
            this.state.ready(client.sessionId);
        }

        let messages: Map<Player, string> = new Map();
        let phaseAction = "role assignment";
        switch (this.state.phase) {
            case "prep":
                if (!this.state.allAreReady()) {
                    console.debug("Not everyone is ready yet.");
                    return;
                }

                let err = this.state.checkRoleSelectionCount();
                if (err) {
                    console.error(err);
                    this.messager.Notify(client, err);
                    return;
                }

                // close the room to new players
                this.lock();

                messages = this.state.startNighttime();

                break;

            case "doppelganger":
            case "nighttime":
                phaseAction = "night choice";
                this.state.setNightChoices(client.sessionId, params.selectedCards, params.selectedPlayers);

                if (this.state.allAreReady()) {
                    messages = this.state.startDaytime();
                }

                break;

            case "daytime":
            case "results":
            default:
                err = `Phase=${this.state.phase} not yet implemented.`;
                console.error(err);
                this.messager.Notify(client, err);
                return;
        }

        // Send any messages generated by the state change
        // TODO: generalize this
        messages.forEach((message: string, player: Player) => {
            const roleID = player.role.roleID;
            const playerName = player.name === null ? player.client.sessionId : player.name;
            console.debug(
                `Notifying ${playerName} of their ${phaseAction} ${roleID} with custom message "${message}"`
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
