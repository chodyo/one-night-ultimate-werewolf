import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NightTheme } from "../constants/Colors";
import RolePanel from "../components/RolePanel";
import CenterCards from "../components/CenterCards";
import PlayerSelectionAction from '../components/PlayerSelectionAction';
import Modal from '@bit/nexxtway.react-rainbow.modal';
import { updateSelections } from "../assets/GameUtil";
import {SelectionAction} from "../components/SelectionAction";

export default class NightScreen extends React.Component {
  constructor(props) {
    super(props);

    let maxPlayers = 0;
    let maxCenterCards = 0;
    switch (props.role.name) {
      case 'doppelganger':
        maxPlayers = 1;
        break;
      case 'werewolf':
        maxCenterCards = 1;
        break;
      case 'seer':
        maxCenterCards = 2;
        maxPlayers = 1;
        break;
      case 'robber':
        maxPlayers = 1;
        break;
      case 'troublemaker':
        maxPlayers = 2;
        break;
      case 'drunk':
        maxCenterCards = 1;
        break;
    }

    this.state = {
      rolePrompt: '',
      roleDescription: '',
      displayMiddleCards: false,
      selectedCards: [],
      selectedPlayers: [],
      // whether the player has made appropriate selections for their night action
      actionRequiredRoleDefault: true,
      actionRequired: true,
      maxPlayers,
      maxCenterCards,
      centerRolesStub: [
        'center1',
        'center2',
        'center3',
      ],
      isOpen: false,
      initialMessage: null,
    };

    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }

  handleOnClick() {
    return this.setState({ isOpen: true });
  }

  handleOnClose() {
    return this.setState({ isOpen: false });
  }

  componentDidMount() {
    const { role, messageForPlayer } = this.props;

    try {
      const roles = require('../../static/assets/onenight.json');
      const { prompt, description, nightActionRequired } = roles[role.name];
      this.setState({
        rolePrompt: prompt,
        roleDescription: description,
        actionRequiredRoleDefault: nightActionRequired,
        actionRequired: nightActionRequired,
        initialMessage: messageForPlayer,
      });
    } catch (e) {
      console.error('Fucked in the night by:', e);
    }
  }

  insomniac() {
    //Funny message or sunsetting and rising till all night actions are completed.
    //display day - role
  }

  makeSelection = (selectionLabel, isPlayer) => {
    let { selectedCards, maxCenterCards, selectedPlayers, maxPlayers } = this.state;

    let actionRequired;
    if (isPlayer) {
      selectedCards = [];
      selectedPlayers = updateSelections(maxPlayers, selectedPlayers, selectionLabel);
      actionRequired = this.isActionRequired(maxPlayers, selectedPlayers);
    } else {
      selectedPlayers = [];
      selectedCards = updateSelections(maxCenterCards, selectedCards, selectionLabel);
      actionRequired = this.isActionRequired(maxCenterCards, selectedCards);
    }

    this.setState({ selectedCards, selectedPlayers, actionRequired });
  };

  isActionRequired(maxSelectable, selectionList) {
    const selections = selectionList.length;
    if (selections > 0) {
      console.debug("Is action required? " + this.state.actionRequired);
      console.debug("Selections are " + selections);
      console.debug("Maximum selections can be " + maxSelectable);
      return selections !== maxSelectable;
    } else {
      console.debug("Else: Is action required? " + this.state.actionRequired);
      console.debug("Else: Selections are " + selections);
      console.debug("Else: Maximum selections can be " + maxSelectable);
      return this.state.actionRequiredRoleDefault;
    }
  }

  emphasizeText = (text) => <Text style={styles.emphasis}>{text}</Text>;

  render() {
    const { players, player, role, handleNightAction, messageForPlayer } = this.props;
    const { rolePrompt, roleDescription, selectedCards, selectedPlayers, actionRequired, centerRolesStub, initialMessage } = this.state;

    const selectablePlayers = players.filter(p => p.id !== player.id);
    const loneWolf = players.filter(p => p.id !== player.id && p.role.name === 'werewolf').length === 0;

    const doppelganger = (
      //display all playernames in room to pick from
      //Send server which player was picked
      //display new doppelganger role
      <PlayerSelectionAction players={selectablePlayers} maxSelectable={1} onSelection={this.makeSelection} selected={selectedPlayers} />
    );
    const werewolf = (
      //werewolves assigned > 1
      //display other werewolves
      //ELSE display cards in the center for picking 1 to look at
      //Send Server which center card was looked at
      //Display selected card
      <>
        {!loneWolf && <Button title="Reveal wolfmate" onPress={this.handleOnClick} />}
        <Modal id="modal-1" isOpen={this.state.isOpen} onRequestClose={this.handleOnClose}>
          <Text>{initialMessage}</Text>
        </Modal>
        {loneWolf &&
          < CenterCards centerRoles={centerRolesStub} onSelection={this.makeSelection} selected={selectedCards} />
        }
      </>
    );
    const minion = (
      //display players that are werewolves
      <>
        <Button title="Reveal werewolfs" onPress={this.handleOnClick} />
        <Modal id="modal-1" isOpen={this.state.isOpen} onRequestClose={this.handleOnClose}>
          <Text>{initialMessage}</Text>
        </Modal>
      </>
    );

    const mason = (
      //display player that is a masons
      <>
        <Button
          id="button-1"
          title="Reveal masons"
          onPress={this.handleOnClick}
        />
        <Modal id="modal-1" isOpen={this.state.isOpen} onRequestClose={this.handleOnClose}>
          <Text>{initialMessage}</Text>
        </Modal>
      </>
    );
    const seer = (
      //display option to pick from player or look at 2 in the center
      //Send server which player or which center cards were selected
      //display player role or picked center cards roles
      <>
        <PlayerSelectionAction players={selectablePlayers} maxSelectable={1} onSelection={this.makeSelection} selected={selectedPlayers} />
        <CenterCards centerRoles={centerRolesStub} onSelection={this.makeSelection} selected={selectedCards} />
      </>
    );
    const robber = (
      //display option to rob or not
      //display players to pick from
      //Send server which player was picked
      //display picked player's role
      <PlayerSelectionAction players={selectablePlayers} onSelection={this.makeSelection} selected={selectedPlayers} />
    );
    const troublemaker = (
      //display option to troublemake or not
      //display players to pick from (select 2)
      //Send server which players were picked
      //nothing else, maybe display confirmation that player_x & player_y were switched
      <PlayerSelectionAction players={selectablePlayers} onSelection={this.makeSelection} selected={selectedPlayers} />
    );
    const drunk = (
      //display cards in the center for picking 1 to switch with players card
      //Send Server which center card was selected
      //nothing else, maybe display confirmation that centerCard_x was swtiched with drunk
      <CenterCards centerRoles={centerRolesStub} onSelection={this.makeSelection} selected={selectedCards} />
    );

    return (
      <View style={styles.container}>
        <Button
          title="Ready"
          style={styles.unSelectedButton}
          onPress={() => handleNightAction(selectedCards, selectedPlayers)}
          disabled={actionRequired}
        />
        <Text style={styles.getStartedText}>
          {player.name}, your role is the {this.emphasizeText(role.name)}, which is on the {this.emphasizeText(role.team)} team.
        </Text>
        <RolePanel title={role.name}>
          <Text style={styles.getStartedText}>
            {roleDescription}
          </Text>
        </RolePanel>
        <Text style={styles.getStartedText}>
          Please: {rolePrompt}
        </Text>
        <SelectionAction />
        {role.name === 'doppelganger' && doppelganger}
        {role.name === 'werewolf' && werewolf}
        {role.name === 'minion' && minion}
        {role.name === 'mason' && mason}
        {role.name === 'seer' && seer}
        {role.name === 'robber' && robber}
        {role.name === 'troublemaker' && troublemaker}
        {role.name === 'drunk' && drunk}
        {messageForPlayer !== '' &&
          <Text style={styles.getStartedText}>
            Yo!: {messageForPlayer}
          </Text>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: NightTheme.darkBlue,
  },
  getStartedText: {
    fontSize: 30,
    color: NightTheme.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
  emphasis: {
    fontSize: 32,
    color: NightTheme.inputText,
  },
});
