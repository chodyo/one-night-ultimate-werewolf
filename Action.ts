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

export type ActionFunction = (client: Client, params: any, Room: Room) => void;

// Not required, just handy

export enum actions {
    setPlayerName = "setPlayerName",
    updateSelectedRole = "updateSelectedRole",
    startGame = "startGame",
}
export type Action = keyof typeof actions;
