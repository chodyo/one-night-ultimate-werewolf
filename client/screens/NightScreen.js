import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NightTheme } from "../constants/Colors";
import RolePanel from "../components/RolePanel";
import { updateSelections } from "../assets/GameUtil";
import Peek from "../components/Peek";
import SelectionAction from "../components/SelectionAction";

export default class NightScreen extends React.Component {
  constructor(props) {
    super(props);

    const { players, player, role } = props;
    let maxPlayers = 0;
    let maxCenterCards = 0;
    let peekable = false;
    let peekTitle = 'Reveal ';

    const lonewolf = players.filter(p => p.id !== player.id && p.role.name === 'werewolf').length === 0;

    switch (role.name) {
      case 'doppelganger':
        maxPlayers = 1;
        break;
      case 'werewolf':
        if (lonewolf) {
          maxCenterCards = 1;
        } else {
          peekable = true;
          peekTitle += 'Wolfmates';
        }
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
      case 'minion':
        peekable = true;
        peekTitle += 'Masters';
        break;
      case 'mason':
        peekable = true;
        peekTitle += 'Guildmates';
        break;
    }

    this.state = {
      // whether the player has made appropriate selections for their night action
      actionRequiredRoleDefault: true,
      actionRequired: true,
      centerCards: [
        'center1',
        'center2',
        'center3',
      ],
      displayMiddleCards: false,
      initialMessage: null,
      maxCenterCards,
      maxPlayers,
      peekable,
      peekOpen: false,
      peekTitle,
      rolePrompt: '',
      roleDescription: '',
      selectedCards: [],
      selectedPlayers: [],
      selectablePlayers: players.filter(p => p.id !== player.id),
    };

    this.handleOpenPeek = this.handleOpenPeek.bind(this);
    this.handleClosePeek = this.handleClosePeek.bind(this);
  }

  handleOpenPeek() {
    return this.setState({ peekOpen: true });
  }

  handleClosePeek() {
    return this.setState({ peekOpen: false });
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

  selectNone = () => {
    this.setState((s) => ({ ...s, selectedCards: [], selectedPlayers: [], actionRequired: s.actionRequiredRoleDefault }));
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
    const { player, role, handleNightAction } = this.props;
    const {
      peekable,
      peekOpen,
      peekTitle,
      rolePrompt,
      roleDescription,
      selectedCards,
      selectablePlayers,
      selectedPlayers,
      maxPlayers,
      maxCenterCards,
      actionRequired,
      actionRequiredRoleDefault,
      centerCards,
      initialMessage
    } = this.state;

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
        {peekable && (
          <Peek
            title={peekTitle}
            message={initialMessage}
            isOpen={peekOpen}
            onOpen={this.handleOpenPeek}
            onClose={this.handleClosePeek}
          />
        )}
        <SelectionAction
          players={selectablePlayers}
          maxPlayers={maxPlayers}
          selectedPlayers={selectedPlayers}
          cards={centerCards}
          maxCards={maxCenterCards}
          selectedCards={selectedCards}
          onSelection={this.makeSelection}
          actionRequired={actionRequiredRoleDefault}
          selectNone={this.selectNone}
        />
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
