# `One Night Werewolf`

A version of One Night Online Gameplay with Colyseus, Node, React Native App, and TypeScript.

## :wolf: Project Setup

Install project dependencies.
```
`yarn install` || `yarn`
```

## Structure

- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `MyRoom.ts`: the apps empty room handler, with room logic
- `package.json`:
    - `scripts`:
        - `yarn start`: runs `ts-node index.ts` which is the main entry point.
        - `yarn start watch`: runs `ts-node-dev index.ts` which starts up the server and refreshes on file change saves.
        - `yarn start client`: runs `yarn --cwd client run start` which runs the start in client/package.json in order to start up the client.
        - `yarn dev`: runs `yarn run watch` and `yarn run client` which starts up the server, and the client.
        - `yarn run loadtest`: runs the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool for testing the connection, using the `loadtest/example.ts` script.
        - `yarn test`: runs unit tests [`./server/test/*.test.ts`](https://medium.com/@RupaniChirag/writing-unit-tests-in-typescript-d4719b8a0a40) for Server side actions `/server/test/*.test.ts` script.
    - `dependencies`:
        - `@colyseus/monitor`
        - `@colyseus/social`
        - `colyseus`
        - `cors`
        - `express`
        - `express-jwt`
        - `concurrently`
        - `express`
        - `nodemon`
    - `devDependencies`
        - `@colyseus/loadtest` 
        - `@types/cors` 
        - `@types/express`
        - `ts-node` 
        - `ts-node-dev` 
        - `typescript` - `tsconfig.json`: TypeScript configuration file

## Running One Night Werewolf
- `yarn install`
- For development run: `yarn run dev`. This starts and watches a node (index.ts) and starts up the expo development App.
- ToDo: Create a production script

## Testing One Night Werewolf
- For testing run: `yarn test`. This starts the unit test for server.

## License

MIT
