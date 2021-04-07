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

    const picard = "Jean-Luc";
    const ryker = "William";
    const troi = "Deanna";
    const worf = "Worf";
    const forge = "Geordi";
    const crusher = "Beverly";
    const spiner = "Data";

    const center0 = "center0";
    const center1 = "center1";
    const center2 = "center2";

    let doppelgangerRole: Role;
    let robberRole: Role;
    let troublemakerRole: Role;
    let drunkRole: Role;
    let werewolfRole: Role;
    let seerRole: Role;
    let insomniacRole: Role;

    let doppelgangerPlayer: Player;
    let robberPlayer: Player;
    let troublemakerPlayer: Player;
    let drunkPlayer: Player;
    let werewolfPlayer: Player;
    let seerPlayer: Player;
    let insomniacPlayer: Player;

    // Setup state with roles/players sufficient for each scenario
    beforeEach(() => {
      // Mimics prep phase
      state.addPlayer(picard);
      state.addPlayer(ryker);
      state.addPlayer(troi);
      state.addPlayer(worf);
      state.addPlayer(forge);
      state.addPlayer(crusher);
      state.addPlayer(spiner);

      state.updatePlayerName(picard, picard);
      state.updatePlayerName(ryker, ryker);
      state.updatePlayerName(troi, troi);
      state.updatePlayerName(worf, worf);
      state.updatePlayerName(forge, forge);
      state.updatePlayerName(crusher, crusher);
      state.updatePlayerName(spiner, spiner);

      state.setRoleActive(doppelgangerId, true);
      state.setRoleActive(werewolfId, true);
      state.setRoleActive(seerId, true);
      state.setRoleActive(robberId, true);
      state.setRoleActive(troublemakerId, true);
      state.setRoleActive(drunkId, true);
      state.setRoleActive(insomniacId, true);
      state.setRoleActive("villager0", true);
      state.setRoleActive("villager1", true);
      state.setRoleActive("villager2", true);
      //--- ends prep

      doppelgangerRole = state.roles[doppelgangerId];
      robberRole = state.roles[robberId];
      troublemakerRole = state.roles[troublemakerId];
      drunkRole = state.roles[drunkId];
      werewolfRole = state.roles[werewolfId];
      seerRole = state.roles[seerId];
      insomniacRole = state.roles[insomniacId];

      // Mimics state.distributeRoles() without randomization
      doppelgangerPlayer = state.players[picard];
      robberPlayer = state.players[ryker];
      troublemakerPlayer = state.players[troi];
      drunkPlayer = state.players[worf];
      werewolfPlayer = state.players[forge];
      seerPlayer = state.players[crusher];
      insomniacPlayer = state.players[spiner];

      doppelgangerPlayer.role = doppelgangerRole;
      robberPlayer.role = robberRole;
      troublemakerPlayer.role = troublemakerRole;
      drunkPlayer.role = drunkRole;
      werewolfPlayer.role = werewolfRole;
      seerPlayer.role = seerRole;
      insomniacPlayer.role = insomniacRole;

      state.rolePlayers.set(doppelgangerRole, doppelgangerPlayer);
      state.rolePlayers.set(robberRole, robberPlayer);
      state.rolePlayers.set(troublemakerRole, troublemakerPlayer);
      state.rolePlayers.set(drunkRole, drunkPlayer);
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
      state.rolePlayers.set(seerRole, seerPlayer);
      state.rolePlayers.set(insomniacRole, insomniacPlayer);

      state.centerRoles.set(center0, state.roles["villager0"])
      state.centerRoles.set(center1, state.roles["villager1"])
      state.centerRoles.set(center2, state.roles["villager2"])
      //--- ends state.distributeRoles()
    });

    describe("on doppelganger choice", () => {
      describe("as robber", () => {
        it("should switch roles with selected player", () => {
          state.distributeDoppelsRole(picard, ryker);

          expect(doppelgangerPlayer.role.name).to.equal("robber");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(picard, [], [worf]);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            const playerID = player.sessionId

            switch (playerID) {
              case picard:
                expect(role.name, `${player.name} should be doppel-robbed into drunk`).to.equal("drunk");
                expect(state["daytimeMessage"](playerID), `${player.name}'s daytime message should indicate drunk`).to.equal("Your new role is drunk");
                break;
              case worf:
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
          state.distributeDoppelsRole(picard, troi);

          expect(doppelgangerPlayer.role.name).to.equal("troublemaker");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(picard, [], [troi, worf]);
          state.setNightChoices(troi, [], []);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case troi:
                expect(role.name, `${player.name} should be doppel-troublemade into drunk`).to.equal("drunk");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate no choice`).to.equal('You chose not to perform your troublemaker action.');
                break;
              case worf:
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
          state.distributeDoppelsRole(picard, worf);

          expect(doppelgangerPlayer.role.name).to.equal("drunk");
          expect(doppelgangerPlayer.role.roleID).to.equal("drunk1");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(picard, [center1], []);

          state.startPhase("daytime");

          [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
            if (centerLabel === center1) {
              expect(role.name).to.equal("drunk");
              expect(role.roleID).to.equal("drunk1");
              expect(role.doppelganger).to.be.true;
            } else {
              expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
            }
          });

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case picard:
                expect(role.name, `${player.name} should be doppel-drunked into ${center1} card`).to.equal("villager");
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
        state.distributeDoppelsRole(picard, worf);

        state.setNightChoices(ryker, [], [picard]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard:
              expect(role.name, `${player.name} should be the robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be empty`).to.be.empty;
              break;
            case ryker:
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
        state.setNightChoices(ryker, [], [troi]);
        state.setNightChoices(troi, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case ryker:
              expect(role.name, `${player.name} should be robbed into doppelganger`).to.equal("troublemaker");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate the robbed role`).to.equal("Your new role is troublemaker");
              break;
            case troi:
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
        state.distributeDoppelsRole(picard, ryker);
        expect(state.players[picard].role.name).to.equal("robber");
        
        //doppel-robber robs into DRUNK
        state.setNightChoices(picard, [], [worf]);
        //Julia-Robber robs doppel-robber
        state.setNightChoices(ryker, [], [picard]);
        //Drunkerd drunks into center2
        state.setNightChoices(worf, [center2], [])
        
        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard:
              //doppel-robber
              expect(role.name, `${player.name} should be robbed into drunk`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is drunk");
              break;
            case ryker:
              //robber
              expect(role.name, `${player.name} should be robbed into robber`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is drunk");
              break;
            case worf:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal("villager")
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
            expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
          }
        });
      });

      it("should be robber when doppel-robber and robber chose each other", () => {
        // given doppelganger chose the robber player and robbed the robber...
        state.distributeDoppelsRole(picard, ryker);

        //doppel-robber robs Julia-Robber
        state.setNightChoices(picard, [], [ryker]);
        //Julia-Robber robs doppel-robber
        state.setNightChoices(ryker, [], [picard]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard:
              //doppel-robber
              expect(role.doppelganger, `${player.name} should be the doppel-robber`).to.be.true;
              expect(role.name, `${player.name} should be the doppel-robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is robber");
              break;
            case ryker:
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
        state.setNightChoices(troi, [], [ryker, worf]);
        state.setNightChoices(ryker, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case ryker:
              expect(role.name, `${player.name} should be troublemade into drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("You chose not to perform your robber action.");
              break;
            case troi:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${ryker}'s and ${worf}'s roles`);
              break;
            case worf:
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
        state.setNightChoices(ryker, [], [picard]);

        state.setNightChoices(troi, [], [picard, worf]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case ryker:
              expect(role.name, `${player.name} should be robbed into doppelganger`).to.equal("doppelganger");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("Your new role is doppelganger");
              break;
            case picard:
              expect(role.name, `${player.name} should be troublemade into drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case troi:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${picard}'s and ${worf}'s roles`);
              break;
            case worf:
              expect(role.name, `${player.name} should be troublemade into robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should reverse robber choice", () => {
        state.distributeDoppelsRole(picard, worf);

        // given robber chose doppelganger...
        state.setNightChoices(ryker, [], [picard]);

        state.setNightChoices(troi, [], [picard, ryker]);
        state.setNightChoices(worf, [center2], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard:
              expect(role.name, `${player.name} was robbed but should be troublemade back to doppelganger`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case ryker:
              expect(role.name, `${player.name} robbed into doppelganger but should be troublemade back to robber`).to.equal("robber");
              // expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("Your new role is doppelganger");
              break;
            case troi:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${picard}'s and ${ryker}'s roles`);
              break;
            case worf:
              expect(role.name, `${player.name}'s role should be`).to.equal("villager")
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });
    });

    describe("on drunk choice", () => {
      it("should switch roles with the chosen center card", () => {
        state.setNightChoices(worf, [center0], []);

        state.startPhase("daytime");

        [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
          if (centerLabel === center0) {
            expect(role.name).to.equal("drunk");
          } else {
            expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
          }
        });

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case worf:
              expect(role.name, `${player.name} should have drunked into villager`).to.equal("villager");
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
