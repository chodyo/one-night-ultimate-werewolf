import { State } from '../src/State';
import { Messager } from '../src/Message';
import {Player} from "../src/Player";

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('State', () => {
  let state: State;
  let messager: Messager;

  beforeEach(() => {
    messager = sinon.spy();
    state = new State(messager);
  });

  describe('setRoleActive', () => {
    it('should set werewolf0 active when minion is set active with no active werewolves', () => {
      state.setRoleActive('minion0', true);
      expect(state.roles['werewolf0'].active).to.be.true
    });

    it('should toggle both masons active when one is set', () => {
      state.setRoleActive('mason0', true);
      expect(state.roles['mason1'].active).to.be.true

      state.setRoleActive('mason1', false);
      expect(state.roles['mason0'].active).to.be.false
    });
  });

  describe('executeNightActions', () => {
    let doppelgangerPlayer: Player;
    let robberPlayer: Player;
    let troublemakerPlayer: Player;
    let drunkPlayer: Player;

    beforeEach(() => {
      state.addPlayer();
    });

    describe('doppelganger choice', () => {
      describe('as robber', () => {
        it('should switch roles with selected player', () => {});
      });

      describe('as troublemaker', () => {
        it('should switch the roles of the chosen players', () => {});
      });

      describe('as drunk', () => {
        it('should switch roles with the chosen center card', () => {});
      });
    });

    describe('robber choice', () => {
      it('should switch roles with selected player', () => {
        (state as any).nightChoices;
        state["nightChoices"];
        // @ts-ignore
        state.nightChoices;
      });
    });

    describe('troublemaker choices', () => {
      it('should switch the roles of the chosen players', () => {});
    });

    describe('drunk choice', () => {
      it('should switch roles with the chosen center card', () => {});
    });
  });
});
