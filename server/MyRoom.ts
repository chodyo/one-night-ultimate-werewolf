import { Room, Client } from "colyseus";

export class MyRoom extends Room {
  maxClients = 10;

  onCreate(options: any) {
    console.log("MyRoom created!", options);
  }

  onJoin(client: Client, options: any) {
    this.broadcast(`${client.sessionId} joined.`);
  }

  onMessage(client: Client, message: any) {
    console.log("MyRoom received message from", client.sessionId, ":", message);
    this.broadcast(`[${client.sessionId}] $message`);
  }

  onLeave(client: Client, consented: boolean) {
    this.broadcast(`${client.sessionId} left.`);
  }

  onDispose() {
    console.log("Dispose MyRoom.");
  }
}
