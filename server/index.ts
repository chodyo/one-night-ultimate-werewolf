import path from "path";
import http from "http";
import express from "express";
// import serveIndex from "serve-index";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
// import socialRoutes from "@colyseus/social/express"

import { MyRoom } from "./MyRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server
});

// register your room handlers
gameServer.define("my_room", MyRoom);

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

app.use("/", express.static(path.join(__dirname, "static")));
// app.use("/", serveIndex(path.join(__dirname, "static"), { icons: true }));

// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.onShutdown(function() {
  console.log(`game server is going down.`);
});

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
