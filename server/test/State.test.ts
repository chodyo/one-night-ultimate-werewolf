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

  const doppelgangerId = "doppelganger0";
  const werewolfId = "werewolf0";
  const seerId = "seer0";
  const robberId = "robber0";
  const troublemakerId = "troublemaker0";
  const drunkId = "drunk0";
  const insomniacId = "insomniac0";

  const center0 = "center0";
  const center1 = "center1";
  const center2 = "center2";

  const center0CardRole = "villager0";
  const center1CardRole = "villager1";
  const center2CardRole = "villager2";

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
  
  describe("distributeRoles", () => {
    const picard = "Jean-Luc";
    const ryker = "William";
    const troi = "Deanna";
    const data = "Data";

    beforeEach(() => {
      // Mimics prep phase
      state.addPlayer(picard);
      state.addPlayer(ryker);
      state.addPlayer(troi);
      state.addPlayer(data);

      state.updatePlayerName(picard, picard);
      state.updatePlayerName(ryker, ryker);
      state.updatePlayerName(troi, troi);
      state.updatePlayerName(data, data);

      state.setRoleActive(doppelgangerId, true);
      state.setRoleActive(werewolfId, true);
      state.setRoleActive(seerId, true);
      state.setRoleActive(robberId, true);
      state.setRoleActive(troublemakerId, true);
      state.setRoleActive(drunkId, true);
      state.setRoleActive(insomniacId, true);

      doppelgangerRole = state.roles[doppelgangerId];
      robberRole = state.roles[robberId];
      troublemakerRole = state.roles[troublemakerId];
      drunkRole = state.roles[drunkId];
      werewolfRole = state.roles[werewolfId];
      seerRole = state.roles[seerId];
      insomniacRole = state.roles[insomniacId];
      //--- ends prep
    });

    it("shouldn't distribute when rolePlayers is empty", () => {
      state.rolePlayers.set(doppelgangerRole, doppelgangerPlayer);
      state.rolePlayers.set(robberRole, robberPlayer);
      state.rolePlayers.set(troublemakerRole, troublemakerPlayer);
      state.rolePlayers.set(drunkRole, drunkPlayer);
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
      state.rolePlayers.set(seerRole, seerPlayer);
      state.rolePlayers.set(insomniacRole, insomniacPlayer);

      expect(state.distributeRoles()).to.not.throw;
    });
    
    it("should distribute roles", () => {
      state.distributeRoles();
      
      expect(state.players[picard].role).to.not.be.null;
      expect(state.players[ryker].role).to.not.be.null;
      expect(state.players[troi].role).to.not.be.null;

      [...state.rolePlayers.entries()].forEach(([_, player]) => {
        expect(player.name).to.equal("biscuits");
      });

      [...state.centerRoles.entries()].forEach(([_, role]) => {
        expect(role).to.not.be.null;
      });
    });
  });

  describe("executeNightActions", () => {
    const picard_doppel = "Jean-Luc";
    const ryker_robber = "William";
    const troi_troublemaker = "Deanna";
    const worf_werewolf = "Worf";
    const forge_seer = "Geordi";
    const crusher_insomniac = "Beverly";
    const data_drunk = "Data";

    // Setup state with roles/players sufficient for each scenario
    beforeEach(() => {
      // Mimics prep phase
      state.addPlayer(picard_doppel);
      state.addPlayer(ryker_robber);
      state.addPlayer(troi_troublemaker);
      state.addPlayer(worf_werewolf);
      state.addPlayer(forge_seer);
      state.addPlayer(crusher_insomniac);
      state.addPlayer(data_drunk);

      state.updatePlayerName(picard_doppel, picard_doppel);
      state.updatePlayerName(ryker_robber, ryker_robber);
      state.updatePlayerName(troi_troublemaker, troi_troublemaker);
      state.updatePlayerName(worf_werewolf, worf_werewolf);
      state.updatePlayerName(forge_seer, forge_seer);
      state.updatePlayerName(crusher_insomniac, crusher_insomniac);
      state.updatePlayerName(data_drunk, data_drunk);

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
      doppelgangerPlayer = state.players[picard_doppel];
      robberPlayer = state.players[ryker_robber];
      troublemakerPlayer = state.players[troi_troublemaker];
      drunkPlayer = state.players[data_drunk];
      werewolfPlayer = state.players[worf_werewolf];
      seerPlayer = state.players[forge_seer];
      insomniacPlayer = state.players[crusher_insomniac];

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
          state.distributeDoppelsRole(picard_doppel, ryker_robber);

          expect(doppelgangerPlayer.role.name).to.equal("robber");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(picard_doppel, [], [data_drunk]);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            const playerID = player.sessionId

            switch (playerID) {
              case picard_doppel:
                expect(role.name, `${player.name} should be doppel-robbed into drunk`).to.equal("drunk");
                expect(state["daytimeMessage"](playerID), `${player.name}'s daytime message should indicate drunk`).to.equal("Your new role is drunk");
                break;
              case data_drunk:
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
          state.distributeDoppelsRole(picard_doppel, troi_troublemaker);

          expect(doppelgangerPlayer.role.name).to.equal("troublemaker");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(picard_doppel, [], [troi_troublemaker, data_drunk]);
          state.setNightChoices(troi_troublemaker, [], []);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case troi_troublemaker:
                expect(role.name, `${player.name} should be doppel-troublemade into drunk`).to.equal("drunk");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate no choice`).to.equal('You chose not to perform your troublemaker action.');
                break;
              case data_drunk:
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
          state.distributeDoppelsRole(picard_doppel, data_drunk);

          expect(doppelgangerPlayer.role.name).to.equal("drunk");
          expect(doppelgangerPlayer.role.roleID).to.equal("drunk1");
          expect(doppelgangerPlayer.role.doppelganger).to.be.true;

          state.setNightChoices(picard_doppel, [center1], []);

          state.startPhase("daytime");

          [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
            if (centerLabel === center1) {
              //expect finalCenterRoles
              // expect(role.name).to.equal("drunk");
              // expect(role.roleID).to.equal("drunk1");
              // expect(role.doppelganger).to.be.true;
            } else {
              expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
            }
          });

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case picard_doppel:
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
        state.distributeDoppelsRole(picard_doppel, data_drunk);

        state.setNightChoices(ryker_robber, [], [picard_doppel]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard_doppel:
              expect(role.name, `${player.name} should be the robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be empty`).to.be.empty;
              break;
            case ryker_robber:
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
        state.setNightChoices(ryker_robber, [], [troi_troublemaker]);
        state.setNightChoices(troi_troublemaker, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case ryker_robber:
              expect(role.name, `${player.name} should be robbed into doppelganger`).to.equal("troublemaker");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate the robbed role`).to.equal("Your new role is troublemaker");
              break;
            case troi_troublemaker:
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
        state.distributeDoppelsRole(picard_doppel, ryker_robber);
        expect(state.players[picard_doppel].role.name).to.equal("robber");

        //doppel-robber robs into DRUNK
        state.setNightChoices(picard_doppel, [], [data_drunk]);
        //Julia-Robber robs doppel-robber
        state.setNightChoices(ryker_robber, [], [picard_doppel]);
        //Drunkerd drunks into center2
        state.setNightChoices(data_drunk, [center2], [])

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard_doppel:
              //doppel-robber
              expect(role.name, `${player.name} should be robbed into drunk`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is drunk");
              break;
            case ryker_robber:
              //robber
              expect(role.name, `${player.name} should be robbed into robber`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is drunk");
              break;
            case data_drunk:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal("villager")
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });

        [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
          if (centerLabel === center2) {
            // expect finalCenterRoles
            // expect(role.doppelganger).to.be.true;
            // expect(role.name).to.equal("robber");
          } else {
            expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
          }
        });
      });

      it("should be robber when doppel-robber and robber chose each other", () => {
        // given doppelganger chose the robber player and robbed the robber...
        state.distributeDoppelsRole(picard_doppel, ryker_robber);

        //doppel-robber robs Julia-Robber
        state.setNightChoices(picard_doppel, [], [ryker_robber]);
        //Julia-Robber robs doppel-robber
        state.setNightChoices(ryker_robber, [], [picard_doppel]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard_doppel:
              //doppel-robber
              expect(role.doppelganger, `${player.name} should be the doppel-robber`).to.be.true;
              expect(role.name, `${player.name} should be the doppel-robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should indicate robbed role`).to.equal("Your new role is robber");
              break;
            case ryker_robber:
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
        state.setNightChoices(troi_troublemaker, [], [ryker_robber, data_drunk]);
        state.setNightChoices(ryker_robber, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case ryker_robber:
              expect(role.name, `${player.name} should be troublemade into drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("You chose not to perform your robber action.");
              break;
            case troi_troublemaker:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${ryker_robber}'s and ${data_drunk}'s roles`);
              break;
            case data_drunk:
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
        state.setNightChoices(ryker_robber, [], [picard_doppel]);

        state.setNightChoices(troi_troublemaker, [], [picard_doppel, data_drunk]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case ryker_robber:
              expect(role.name, `${player.name} should be robbed into doppelganger`).to.equal("doppelganger");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("Your new role is doppelganger");
              break;
            case picard_doppel:
              expect(role.name, `${player.name} should be troublemade into drunk`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case troi_troublemaker:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${picard_doppel}'s and ${data_drunk}'s roles`);
              break;
            case data_drunk:
              expect(role.name, `${player.name} should be troublemade into robber`).to.equal("robber");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should reverse robber choice", () => {
        state.distributeDoppelsRole(picard_doppel, data_drunk);

        // given robber chose doppelganger...
        state.setNightChoices(ryker_robber, [], [picard_doppel]);

        state.setNightChoices(troi_troublemaker, [], [picard_doppel, ryker_robber]);
        state.setNightChoices(data_drunk, [center2], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard_doppel:
              expect(role.name, `${player.name} was robbed but should be troublemade back to doppelganger`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case ryker_robber:
              expect(role.name, `${player.name} robbed into doppelganger but should be troublemade back to robber`).to.equal("robber");
              // expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("Your new role is doppelganger");
              break;
            case troi_troublemaker:
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`You switched ${picard_doppel}'s and ${ryker_robber}'s roles`);
              break;
            case data_drunk:
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
        state.setNightChoices(data_drunk, [center0], []);

        state.startPhase("daytime");

        [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
          if (centerLabel === center0) {
            // expect finalCenterRoles
            // expect(role.name).to.equal("drunk");
          } else {
            expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
          }
        });

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case data_drunk:
              expect(role.name, `${player.name} should have drunked into villager`).to.equal("villager");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      describe("should not reveal drunk as center card", () => {
        it("when lonewolf views the center card that was drank", () => {
          state.setNightChoices(data_drunk, [center0], []);
          state.setNightChoices(worf_werewolf, [center0], []);

          state.startPhase("daytime");

          [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
            if (centerLabel === center0) {
              // expect finalCenterRoles
              // expect(role.name).to.equal("drunk");
            } else {
              expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
            }
          });

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case data_drunk:
                expect(role.name, `${player.name} should have drunked into villager`).to.equal("villager");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
                break;
              case worf_werewolf:
                expect(role.name, `${player.name} should still be a werewolf`).to.equal("werewolf");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.equal("The center0 card is villager.");
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
            }
          });
        });
        
        it("when lonewolf views the center card that was drank, and doppel-drank", () => {
          state.distributeDoppelsRole(picard_doppel, data_drunk);
          state.setNightChoices(picard_doppel, [center0], []);
          state.setNightChoices(data_drunk, [center0], []);
          state.setNightChoices(worf_werewolf, [center0], []);

          state.startPhase("daytime");

          [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
            if (centerLabel === center0) {
              // expect finalCenterRoles
              // expect(role.name).to.equal("drunk");
            } else {
              expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
            }
          });

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case picard_doppel:
                expect(role.name, `${player.name} should have drunked into villager`).to.equal("villager");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
                break;
              case data_drunk:
                expect(role.name, `${player.name} should have drunked into doppelganger`).to.equal("doppelganger");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
                break;
              case worf_werewolf:
                expect(role.name, `${player.name} should still be a werewolf`).to.equal("werewolf");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.equal("The center0 card is villager.");
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
            }
          });
        });

        it("when seer views the center card that was drank", () => {
          state.setNightChoices(data_drunk, [center0], []);
          state.setNightChoices(forge_seer, [center0, center1], []);

          state.startPhase("daytime");

          [...state.centerRoles.entries()].forEach(([centerLabel, role]) => {
            if (centerLabel === center0) {
              // expect finalCenterRoles
              // expect(role.name).to.equal("drunk");
            } else {
              expect(role.name).to.equal("villager", `${centerLabel} should remain unchanged as villager`);
            }
          });

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case data_drunk:
                expect(role.name, `${player.name} should have drunked into villager`).to.equal("villager");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
                break;
              case forge_seer:
                expect(role.name, `${player.name} should still be a seer`).to.equal("seer");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.equal("The center0, center1 cards are villager and villager respectively.");
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
            }
          });
        });
       });
      
      it("should executioner the drunk if they don't choose", () => {
        state.setNightChoices(data_drunk, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case data_drunk:
              expect(role.name, `${player.name} should have drunked into villager`).to.equal("drunk");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });
    });

    describe("on werewolf choice", () => {
      it("should display chosen center card's role", () => {
        const choice = center2
        state.setNightChoices(worf_werewolf, [choice], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case worf_werewolf:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`The ${choice} card is villager.`);
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should display nothing with no action chosen", () => {
        state.setNightChoices(worf_werewolf, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case worf_werewolf:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal('You chose not to perform your werewolf action.');
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should not have a night action or message when !loneWolf", () => {
        state.distributeDoppelsRole(picard_doppel, worf_werewolf);
        state.setNightChoices(worf_werewolf, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case picard_doppel:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal('werewolf')
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            case worf_werewolf:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });
    });

    describe("on seer choices", () => {
      it("should display chosen player's role", () => {
        const choice = ryker_robber;
        state.setNightChoices(forge_seer, [], [choice]);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case forge_seer:
              expect(role.name, `${player.name} should be seer`).to.equal("seer");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`${choice} is a ${robberPlayer.role.name}`);
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name);
          }
        });
      });

      describe("on choosing doppelPlayer", () => {
        it("should display doppelganger as doppelganger", () => {
          const choice = picard_doppel;
          state.distributeDoppelsRole(picard_doppel, crusher_insomniac);
          state.setNightChoices(forge_seer, [], [choice]);

          state.startPhase("daytime");

          [...state["finalResults"].entries()].forEach(([player, role]) => {
            switch (player.sessionId) {
              case forge_seer:
                expect(role.name, `${player.name} should be seer`).to.equal("seer");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`${choice} is a ${doppelgangerPlayer.role.name}`);
                break;
              case picard_doppel:
                expect(role.name, `${player.name} should be villager`).to.equal("insomniac");
                expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal("You woke up as a doppelganger.");
                break;
              default:
                expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
            }
          });

          it("should display doppelganger (drunk) as the center card chosen", () => {
            const choice = picard_doppel;
            state.distributeDoppelsRole(picard_doppel, data_drunk);
            state.setNightChoices(picard_doppel, [center1], []);
            state.setNightChoices(forge_seer, [], [choice]);

            state.startPhase("daytime");

            [...state["finalResults"].entries()].forEach(([player, role]) => {
              switch (player.sessionId) {
                case forge_seer:
                  expect(role.name, `${player.name} should be seer`).to.equal("seer");
                  expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`${choice} is a villager`);
                  break;
                case picard_doppel:
                  expect(role.name, `${player.name} should be villager`).to.equal("villager");
                  expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.be.empty;
                  break;
                default:
                  expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
              }
            });
          });
        });
      });

      it("should display chosen center cards' role", () => {
        const choice = [center0, center2]
        state.setNightChoices(forge_seer, choice, []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case forge_seer:
              expect(role.name, `${player.name} should be seer`).to.equal("seer");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal(`The ${choice.join(", ")} cards are villager and villager respectively.`);
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });

      it("should display chosen center cards' role", () => {
        state.setNightChoices(forge_seer, [], []);

        state.startPhase("daytime");

        [...state["finalResults"].entries()].forEach(([player, role]) => {
          switch (player.sessionId) {
            case forge_seer:
              expect(role.name, `${player.name} should be seer`).to.equal("seer");
              expect(state["daytimeMessage"](player.sessionId), `${player.name}'s daytime message should be`).to.equal('You chose not to perform your seer action.');
              break;
            default:
              expect(role.name, `${player.name}'s role shouldn't have changed!`).to.equal(player.role.name)
          }
        });
      });
    });

  });

  describe("nighttimeMessage", () => {
    const mason0 = "mason0";
    const mason1 = "mason1";
    const minionId = "minion0";
    // const werewolf1 = "werewolf1";

    const picard_doppel = "Jean-Luc";
    const ryker_robber = "William";
    const troi_minion = "Deanna";
    const worf_werewolf = "Worf";
    const forge_mason = "Geordi";
    const crusher_mason = "Beverly";
    // const data_werewolf = "Data";

    let minionRole: Role;
    let mason0Role: Role;
    let mason1Role: Role;
    // let werewolf1Role: Role;

    // Setup state with roles/players sufficient for each scenario
    beforeEach(() => {
      // Mimics prep phase
      state.addPlayer(picard_doppel);
      state.addPlayer(ryker_robber);
      state.addPlayer(troi_minion);
      state.addPlayer(worf_werewolf);
      state.addPlayer(forge_mason);
      state.addPlayer(crusher_mason);
      // state.addPlayer(data_werewolf);

      state.updatePlayerName(picard_doppel, picard_doppel);
      state.updatePlayerName(ryker_robber, ryker_robber);
      state.updatePlayerName(troi_minion, troi_minion);
      state.updatePlayerName(worf_werewolf, worf_werewolf);
      state.updatePlayerName(forge_mason, forge_mason);
      state.updatePlayerName(crusher_mason, crusher_mason);
      // state.updatePlayerName(data_werewolf, data_werewolf);

      state.setRoleActive(doppelgangerId, true);
      state.setRoleActive(werewolfId, true);
      // state.setRoleActive(werewolf1, true);
      state.setRoleActive(minionId, true);
      state.setRoleActive(mason0, true);
      state.setRoleActive(mason1, true);
      state.setRoleActive(robberId, true);
      state.setRoleActive("villager0", true);
      state.setRoleActive("villager1", true);
      state.setRoleActive("villager2", true);
      //--- ends prep

      let minionPlayer: Player;
      let mason0Player: Player;
      let mason1Player: Player;
      // let werewolf1Player: Player;

      doppelgangerRole = state.roles[doppelgangerId];
      robberRole = state.roles[robberId];
      minionRole = state.roles[minionId];
      mason0Role = state.roles[mason0];
      mason1Role = state.roles[mason1];
      werewolfRole = state.roles[werewolfId];
      // werewolf1Role = state.roles[werewolf1];

      // Mimics state.distributeRoles() without randomization
      doppelgangerPlayer = state.players[picard_doppel];
      robberPlayer = state.players[ryker_robber];
      minionPlayer = state.players[troi_minion];
      mason0Player = state.players[forge_mason];
      mason1Player = state.players[crusher_mason];
      werewolfPlayer = state.players[worf_werewolf];
      // werewolf1Player = state.players[data_werewolf];

      doppelgangerPlayer.role = doppelgangerRole;
      robberPlayer.role = robberRole;
      minionPlayer.role = minionRole;
      mason0Player.role = mason0Role;
      werewolfPlayer.role = werewolfRole;
      mason1Player.role = mason1Role;
      // werewolf1Player.role = werewolf1Role;

      state.rolePlayers.set(doppelgangerRole, doppelgangerPlayer);
      state.rolePlayers.set(robberRole, robberPlayer);
      state.rolePlayers.set(minionRole, minionPlayer);
      state.rolePlayers.set(mason0Role, mason0Player);
      state.rolePlayers.set(mason1Role, mason1Player);
      // state.rolePlayers.set(werewolf1Role, werewolf1Player);

      state.centerRoles.set(center0, state.roles["villager0"])
      state.centerRoles.set(center1, state.roles["villager1"])
      state.centerRoles.set(center2, state.roles["villager2"])
      //--- ends state.distributeRoles()
    });

    describe("not werewolf, mason, minion or doppelganger", () => {
      it("should be empty", () => {
        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](ryker_robber)).to.be.empty;
      });
    });
    
    describe("doppelganger", () => {
      it("should show role as robber", () => {
        state.distributeDoppelsRole(picard_doppel, ryker_robber);

        expect(doppelgangerPlayer.role.name).to.equal("robber");
        expect(doppelgangerPlayer.role.doppelganger).to.be.true;

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](picard_doppel)).to.equal(`You are the ${robberRole.name}`);
      });
    });

    describe("werewolf", () => {
      it("should be lonewolf", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](worf_werewolf)).to.equal(`You are the only ${werewolfRole.name}.`);
      });

      it("should show all werewolves", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.distributeDoppelsRole(picard_doppel, worf_werewolf);

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](worf_werewolf)).to.equal(`The werewolves are ${worf_werewolf}, ${picard_doppel}.`);
      });
    });

    describe("minion", () => {
      it("should show no werewolves", () => {
        state.rolePlayers.set(robberRole, werewolfPlayer);

        state.centerRoles.set(center0, werewolfRole)

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](troi_minion)).to.equal(`There are no werewolves.`);
      });

      it("should show single werewolf", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](troi_minion)).to.equal(`The werewolf is ${werewolfPlayer.name}.`);
      });

      it("should show all werewolves", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.distributeDoppelsRole(picard_doppel, worf_werewolf);

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](troi_minion)).to.equal(`The werewolves are ${worf_werewolf}, ${picard_doppel}.`);
      });
    });

  });

  describe("nighttime", () => {
    const mason0 = "mason0";
    const mason1 = "mason1";
    const minionId = "minion0";
    // const werewolf1 = "werewolf1";

    const picard_doppel = "Jean-Luc";
    const ryker_robber = "William";
    const troi_minion = "Deanna";
    const worf_werewolf = "Worf";
    const forge_mason = "Geordi";
    const crusher_mason = "Beverly";
    // const data_werewolf = "Data";

    let minionRole: Role;
    let mason0Role: Role;
    let mason1Role: Role;
    // let werewolf1Role: Role;

    // Setup state with roles/players sufficient for each scenario
    beforeEach(() => {
      // Mimics prep phase
      state.addPlayer(picard_doppel);
      state.addPlayer(ryker_robber);
      state.addPlayer(troi_minion);
      state.addPlayer(worf_werewolf);
      state.addPlayer(forge_mason);
      state.addPlayer(crusher_mason);
      // state.addPlayer(data_werewolf);

      state.updatePlayerName(picard_doppel, picard_doppel);
      state.updatePlayerName(ryker_robber, ryker_robber);
      state.updatePlayerName(troi_minion, troi_minion);
      state.updatePlayerName(worf_werewolf, worf_werewolf);
      state.updatePlayerName(forge_mason, forge_mason);
      state.updatePlayerName(crusher_mason, crusher_mason);
      // state.updatePlayerName(data_werewolf, data_werewolf);

      state.setRoleActive(doppelgangerId, true);
      state.setRoleActive(werewolfId, true);
      // state.setRoleActive(werewolf1, true);
      state.setRoleActive(minionId, true);
      state.setRoleActive(mason0, true);
      state.setRoleActive(mason1, true);
      state.setRoleActive(robberId, true);
      state.setRoleActive("villager0", true);
      state.setRoleActive("villager1", true);
      state.setRoleActive("villager2", true);
      //--- ends prep

      let minionPlayer: Player;
      let mason0Player: Player;
      let mason1Player: Player;
      // let werewolf1Player: Player;

      doppelgangerRole = state.roles[doppelgangerId];
      robberRole = state.roles[robberId];
      minionRole = state.roles[minionId];
      mason0Role = state.roles[mason0];
      mason1Role = state.roles[mason1];
      werewolfRole = state.roles[werewolfId];
      // werewolf1Role = state.roles[werewolf1];

      // Mimics state.distributeRoles() without randomization
      doppelgangerPlayer = state.players[picard_doppel];
      robberPlayer = state.players[ryker_robber];
      minionPlayer = state.players[troi_minion];
      mason0Player = state.players[forge_mason];
      mason1Player = state.players[crusher_mason];
      werewolfPlayer = state.players[worf_werewolf];
      // werewolf1Player = state.players[data_werewolf];

      doppelgangerPlayer.role = doppelgangerRole;
      robberPlayer.role = robberRole;
      minionPlayer.role = minionRole;
      mason0Player.role = mason0Role;
      werewolfPlayer.role = werewolfRole;
      mason1Player.role = mason1Role;
      // werewolf1Player.role = werewolf1Role;

      state.rolePlayers.set(doppelgangerRole, doppelgangerPlayer);
      state.rolePlayers.set(robberRole, robberPlayer);
      state.rolePlayers.set(minionRole, minionPlayer);
      state.rolePlayers.set(mason0Role, mason0Player);
      state.rolePlayers.set(mason1Role, mason1Player);
      // state.rolePlayers.set(werewolf1Role, werewolf1Player);

      state.centerRoles.set(center0, state.roles["villager0"])
      state.centerRoles.set(center1, state.roles["villager1"])
      state.centerRoles.set(center2, state.roles["villager2"])
      //--- ends state.distributeRoles()
    });

    describe("for doppelganger message", () => {
      it("should have robber messaging", () => {
        state.distributeDoppelsRole(picard_doppel, ryker_robber);

        expect(doppelgangerPlayer.role.name).to.equal("robber");
        expect(doppelgangerPlayer.role.doppelganger).to.be.true;

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](picard_doppel)).to.equal(`You are the ${robberRole.name}`);
      });
    });

    describe("for werewolf message", () => {
      it("should have you as only werewolf", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](worf_werewolf)).to.equal(`You are the only ${werewolfRole.name}.`);
      });

      it("should have all human werewolves", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.distributeDoppelsRole(picard_doppel, worf_werewolf);

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](worf_werewolf)).to.equal(`The werewolves are ${worf_werewolf}, ${picard_doppel}.`);
      });
    });

    describe("for minion message", () => {
      it("should show no werewolves", () => {
        state.rolePlayers.set(robberRole, werewolfPlayer);

        state.centerRoles.set(center0, werewolfRole)

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](troi_minion)).to.equal(`There are no werewolves.`);
      });

      it("should show single werewolf", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](troi_minion)).to.equal(`The werewolf is ${werewolfPlayer.name}.`);
      });

      it("should show all human werewolves", () => {
      state.rolePlayers.set(werewolfRole, werewolfPlayer);
        state.distributeDoppelsRole(picard_doppel, worf_werewolf);

        state.startPhase("nighttime");

        expect(state["nighttimeMessage"](troi_minion)).to.equal(`The werewolves are ${worf_werewolf}, ${picard_doppel}.`);
      });
    });
  });
});
