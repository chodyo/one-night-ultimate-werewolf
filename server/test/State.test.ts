import { State } from "../src/State";
import { Messager } from "../src/Message";
import { Player } from "../src/Player";
import { Role } from "../src/Role";
import { mock } from "ts-mockito";

const chai = require("chai");
const expect = chai.expect;

describe("State", () => {
  let state: State;
  const messager = mock(Messager);

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
    const doppelgangerId = "doppelganger0";
    const werewolfId = "werewolf0";
    const seerId = "seer0";
    const robberId = "robber0";
    const troublemakerId = "troublemaker0";
    const drunkId = "drunk0";
    const insomniacId = "insomniac0";

    const playerId1 = "Tilli";
    const playerId2 = "Julia";
    const playerId3 = "Cody";
    const playerId4 = "Jared";

    const center0 = "center0";
    const center1 = "center1";
    const center2 = "center2";

    let doppelgangerRole: Role;
    let robberRole: Role;
    let troublemakerRole: Role;
    let drunkRole: Role;

    let doppelgangerPlayer: Player;
    let robberPlayer: Player;
    let troublemakerPlayer: Player;
    let drunkPlayer: Player;

    // Setup state with roles/players sufficient for each scenario
    beforeEach(() => {
      // Mimics prep phase
      state.addPlayer(playerId1);
      state.addPlayer(playerId2);
      state.addPlayer(playerId3);
      state.addPlayer(playerId4);

      state.updatePlayerName(playerId1, playerId1);
      state.updatePlayerName(playerId2, playerId2);
      state.updatePlayerName(playerId3, playerId3);
      state.updatePlayerName(playerId4, playerId4);

      state.setRoleActive(doppelgangerId, true);
      state.setRoleActive(werewolfId, true);
      state.setRoleActive(seerId, true);
      state.setRoleActive(robberId, true);
      state.setRoleActive(troublemakerId, true);
      state.setRoleActive(drunkId, true);
      state.setRoleActive(insomniacId, true);
      //--- ends prep

      doppelgangerRole = state.roles[doppelgangerId];
      robberRole = state.roles[robberId];
      troublemakerRole = state.roles[troublemakerId];
      drunkRole = state.roles[drunkId];

      // Mimics state.distributeRoles() without randomization
      doppelgangerPlayer = state.players[playerId1];
      robberPlayer = state.players[playerId2];
      troublemakerPlayer = state.players[playerId3];
      drunkPlayer = state.players[playerId4];

      doppelgangerPlayer.role = doppelgangerRole;
      robberPlayer.role = robberRole;
      troublemakerPlayer.role = troublemakerRole;
      drunkPlayer.role = drunkRole;

      state.rolePlayers.set(doppelgangerRole, doppelgangerPlayer);
      state.rolePlayers.set(robberRole, robberPlayer);
      state.rolePlayers.set(troublemakerRole, troublemakerPlayer);
      state.rolePlayers.set(drunkRole, drunkPlayer);

      state.centerRoles.set(center0, state.roles[werewolfId])
      state.centerRoles.set(center1, state.roles[seerId])
      state.centerRoles.set(center2, state.roles[insomniacId])
      //--- ends state.distributeRoles()
    });

    describe("on doppelganger choice", () => {
      describe("as robber", () => {
        it("should switch roles with selected player", () => {
          state.distributeDoppelsRole(playerId1, playerId2);

          expect(doppelgangerPlayer.role.name).to.equal("robber");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(playerId1, [], [playerId4]);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            const playerID = player.sessionId

            switch (playerID) {
              case playerId1:
                expect(role.name, `${player.name} should be doppel-robbed into drunk`).to.equal("drunk");
                expect(state["daytimeMessage"](playerID), `${player.name}'s daytime message should indicate drunk`).to.equal("Your new role is drunk");
                break;
              case playerId4:
                expect(role.doppelganger, `${player.name} should be the doppel-robber`).to.be.true;
                expect(role.name, `${player.name} should be the doppel-robber`).to.equal("robber");
                expect(state["daytimeMessage"](playerID), `${player.name}'s daytime message should be blank`).to.be.empty;
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
            }
          });
        });
      });

      describe("as troublemaker", () => {
        it("should switch the roles of the chosen players", () => {
          state.distributeDoppelsRole(playerId1, playerId3);

          expect(doppelgangerPlayer.role.name).to.equal("troublemaker");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(playerId1, [], [playerId3, playerId4]);
          state.setNightChoices(playerId3, [], []);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case playerId3:
                expect(role.name, `${player.name} should be doppel-troublemade into drunk`).to.equal("drunk");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate no choice`).to.equal('You chose not to perform your troublemaker action.');
                break;
              case playerId4:
                expect(role.name, `${player.name} should be doppel-troublemade into troublemaker`).to.equal("troublemaker");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate no choice`).to.be.empty;
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
            }
          });
        });
      });

      describe("as drunk", () => {
        it("should switch roles with the chosen center card", () => {
          state.distributeDoppelsRole(playerId1, playerId4);

          expect(doppelgangerPlayer.role.name).to.equal("drunk");
          expect(doppelgangerPlayer.role.roleID).to.equal("drunk1");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(playerId1, [center1], []);

          state.startPhase("daytime");

          [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
            if (centerLabel === center1) {
              expect(role.name).to.equal("drunk");
              expect(role.roleID).to.equal("drunk1");
              expect(role.doppelganger).to.be.true;
            } else {
              expect(role.name).to.satisfy(() => {
                return role.name === "werewolf" || role.name === "insomniac";
              }, `${centerLabel} should remain unchanged as either werewolf or insomniac`);
            }
          });

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case playerId1:
                expect(role.name, `${player.name} should be doppel-drunked into seer`).to.equal("seer");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate no choice`).to.be.empty;
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name);
            }
          });
        });
      });
    });

    describe("on robber choice", () => {
      it("should switch roles with selected player who is the doppelganger", () => {
        state.distributeDoppelsRole(playerId1, playerId4);

        state.setNightChoices(playerId2, [], [playerId1]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId1:
              expect(role.name, `${player.name} should be the robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be empty`).to.be.empty;
              break;
            case playerId2:
              expect(role.doppelganger).to.be.true;
              expect(role.name, `${player.name} should be robbed into doppel-drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate they are now the doppelganger`).to.equal("Your new role is doppelganger");
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should switch roles with selected player who is the troublemaker", () => {
        state.setNightChoices(playerId2, [], [playerId3]);
        state.setNightChoices(playerId3, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId2:
              expect(role.name, `${player.name} should be robbed into doppelganger`).to.equal("troublemaker");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate the robbed role`).to.equal("Your new role is troublemaker");
              break;
            case playerId3:
              expect(role.name, `${player.name} should be the robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate no choice`).to.equal("You chose not to perform your troublemaker action.");
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should be switch roles with the doppel-robber (robbed the drunk)", () => {
        // given doppelganger chose the robber player and robbed the robber...
        state.distributeDoppelsRole(playerId1, playerId2);
        expect(state.players[playerId1].role.name).to.equal("robber");
        
        //doppel-robber robs into DRUNK
        state.setNightChoices(playerId1, [], [playerId4]);
        //Julia-Robber robs doppel-robber
        state.setNightChoices(playerId2, [], [playerId1]);
        //Drunkerd drunks into center2
        state.setNightChoices(playerId4, [center2], [])
        
        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId1:
              //doppel-robber
              expect(role.name, `${player.name} should be robbed into drunk`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is drunk");
              break;
            case playerId2:
              //robber
              expect(role.name, `${player.name} should be robbed into robber`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is drunk");
              break;
            case playerId4:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal("insomniac")
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });

        [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
          if (centerLabel === center2) {
            expect(role.doppelganger).to.be.true;
            expect(role.name).to.equal("robber");
          } else {
            expect(role.name).to.satisfy(() => {
              return role.name === "seer" || role.name === "werewolf";
            }, `${centerLabel} should remain unchanged as either seer or insomniac`);
          }
        });
      });

      it("should be robber when doppel-robber and robber chose each other", () => {
        // given doppelganger chose the robber player and robbed the robber...
        state.distributeDoppelsRole(playerId1, playerId2);

        //doppel-robber robs Julia-Robber
        state.setNightChoices(playerId1, [], [playerId2]);
        //Julia-Robber robs doppel-robber
        state.setNightChoices(playerId2, [], [playerId1]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId1:
              //doppel-robber
              expect(role.doppelganger, `${player.name} should be the doppel-robber`).to.be.true;
              expect(role.name, `${player.name} should be the doppel-robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is robber");
              break;
            case playerId2:
              //robber
              expect(role.name, `${player.name} should be robbed into robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is robber");
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });
    });

    describe("on troublemaker choices", () => {
      it("should switch the roles of the chosen players", () => {
        state.setNightChoices(playerId3, [], [playerId2, playerId4]);
        state.setNightChoices(playerId2, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId2:
              expect(role.name, `${player.name} should be troublemade into drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("You chose not to perform your robber action.");
              break;
            case playerId3:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${playerId2}'s and ${playerId4}'s roles`);
              break;
            case playerId4:
              expect(role.name, `${player.name} should be troublemade into robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("and one choice was robbed", () => {
        // given robber chose doppelganger...
        state.setNightChoices(playerId2, [], [playerId1]);

        state.setNightChoices(playerId3, [], [playerId1, playerId4]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId2:
              expect(role.name, `${player.name} should be robbed into doppelganger`).to.equal("doppelganger");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("Your new role is doppelganger");
              break;
            case playerId1:
              expect(role.name, `${player.name} should be troublemade into drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case playerId3:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${playerId1}'s and ${playerId4}'s roles`);
              break;
            case playerId4:
              expect(role.name, `${player.name} should be troublemade into robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should reverse robber choice", () => {
        state.distributeDoppelsRole(playerId1, playerId4);

        // given robber chose doppelganger...
        state.setNightChoices(playerId2, [], [playerId1]);

        state.setNightChoices(playerId3, [], [playerId1, playerId2]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId1:
              expect(role.name, `${player.name} was robbed but should be troublemade back to doppelganger`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case playerId2:
              expect(role.name, `${player.name} robbed into doppelganger but should be troublemade back to robber`).to.equal("robber");
              // expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("Your new role is doppelganger");
              break;
            case playerId3:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${playerId1}'s and ${playerId2}'s roles`);
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
          }
        });
      });
    });

    describe("on drunk choice", () => {
      it("should switch roles with the chosen center card", () => {
        state.setNightChoices(playerId4, [center0], []);

        state.startPhase("daytime");

        [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
          if (centerLabel === center0) {
            expect(role.name).to.equal("drunk");
          } else {
            expect(role.name).to.satisfy(() => {
              return role.name === "seer" || role.name === "insomniac";
            }, `${centerLabel} should remain unchanged as either seer or insomniac`);
          }
        });

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case playerId4:
              expect(role.name, `${player.name} should have drunked into werewolf`).to.equal("werewolf");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });
    });
  });
});
