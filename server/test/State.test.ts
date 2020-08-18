import { State } from "../src/State";
import { Messager } from "../src/Message";
import { Player } from "../src/Player";
import { mock, when } from "ts-mockito";
import { Client } from "colyseus";

const chai = require("chai");
const expect = chai.expect;

describe("State", () => {
  let state: State;
  const messager = mock(Messager)

  beforeEach(() => {
    state = new State(messager);
  });

  describe("setRoleActive", () => {
    it("should set werewolf0 active when minion is set active with no active werewolves", () => {
      state.setRoleActive("minion0", true);
      expect(state.roles["werewolf0"].active).to.be.true
    });

    it("should toggle both masons active when one is set", () => {
      state.setRoleActive("mason0", true);
      expect(state.roles["mason1"].active).to.be.true

      state.setRoleActive("mason1", false);
      expect(state.roles["mason0"].active).to.be.false
    });
  });

  describe("executeNightActions", () => {
    let sessionId1 = "client1";
    let sessionId2 = "client2";
    let sessionId3 = "client3";
    let sessionId4 = "client4";

    // const doppelgangerPlayer = new Player(sessionId1);
    // const robberPlayer = new Player(sessionId2);
    // const troublemakerPlayer = new Player(sessionId3);
    // const drunkPlayer = new Player(sessionId4);

    let doppelgangerPlayer: Player;
    let robberPlayer: Player;
    let troublemakerPlayer: Player;
    let drunkPlayer: Player;

    beforeEach(() => {
      state.addPlayer(sessionId1);
      state.updatePlayerName(sessionId1, "player1");
      state.addPlayer(sessionId2);
      state.addPlayer(sessionId3);
      state.addPlayer(sessionId4);

      doppelgangerPlayer = state.players[sessionId1];
      robberPlayer = state.players[sessionId2];
      troublemakerPlayer = state.players[sessionId3];
      drunkPlayer = state.players[sessionId4];

      state.setRoleActive("doppelganger0", true);
      state.setRoleActive("werewolf0", true);
      state.setRoleActive("seer0", true);
      state.setRoleActive("robber0", true);
      state.setRoleActive("troublemaker0", true);
      state.setRoleActive("drunk0", true);
      state.setRoleActive("insomniac0", true);
    });

    describe("doppelganger choice", () => {
      describe("as robber", () => {
        it("should switch roles with selected player", () => {});
      });

      describe("as troublemaker", () => {
        it("should switch the roles of the chosen players", () => {});
      });

      describe("as drunk", () => {
        it("should switch roles with the chosen center card", () => {});
      });
    });

    describe("robber choice", () => {
      it("should switch roles with selected player", () => {
        expect(state.players[sessionId1].name).to.equal("player1");
        // (state as any).nightChoices;
        // state["nightChoices"];
        // // @ts-ignore
        // state.nightChoices;
      });
    });

    describe("troublemaker choices", () => {
      it("should switch the roles of the chosen players", () => {});
    });

    describe("drunk choice", () => {
      it("should switch roles with the chosen center card", () => {});
    });
  });
});
