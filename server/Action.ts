import { Room, Client } from "colyseus";

// Client => Server
// {
//     action: Action,
//     params: {
//         name: string, (setPlayerName),
//         roleID: string, (updateSelectedRole),
//         roleEnabled: boolean, (updateSelectedRole)
//     }
// }

// Allows objects other than the Room to create callback functions that utilize Room actions

export type CallbackFunction = (...args: any[]) => void;
export const emptyCallback: CallbackFunction = function() {};

export type ActionFunction = (client: Client, params: any, Room: Room) => CallbackFunction[];

// Not required, just handy

export enum actions {
    setPlayerName = "setPlayerName",
    updateSelectedRole = "updateSelectedRole",
    startGame = "startGame"
}
export type Action = keyof typeof actions;
