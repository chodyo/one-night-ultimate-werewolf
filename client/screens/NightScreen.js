import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NightTheme } from "../constants/Colors";
import RolePanel from "../components/RolePanel";
import CenterCards from "../components/CenterCards";
import PlayerSelectionAction from '../components/PlayerSelectionAction';

export default class NightScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rolePrompt: '',
      roleDescription: '',
      displayMiddleCards: false,
      selectedCards: [],
      selectedPlayers: [],
      centerRolesStub: [
        {
          label: 'center1',
          name: 'werewolf',
        },
        {
          label: 'center2',
          name: 'mason',
        },
        {
          label: 'center3',
          name: 'seer',
        },
      ],
    };
  }

  componentDidMount() {
    const { role } = this.props;

    try {
      const roles = require('../../static/assets/onenight.json');
      const { prompt, description } = roles[role.name];
      this.setState({ rolePrompt: prompt, roleDescription: description });
    } catch (e) {
      console.error('Fucked in the night by:', e);
    }
  }

  doppelganger() {
    //display all playernames in room to pick from
    //Send server which player was picked
    //display new doppelganger role
  }

  werewolf() {
    //werewolves assigned > 1
    //display other werewolves
    //ELSE display cards in the center for picking 1 to look at
    //Send Server which center card was looked at
    //Display selected card
  }
  minion() {
    //display players that are werewolves
  }
  mason() {
    //display player that is a masons
  }
  robber() {
    //display option to rob or not
    //display players to pick from
    //Send server which player was picked
    //display picked player's role
  }
  troublemaker() {
    //display option to troublemake or not
    //display players to pick from (select 2)
    //Send server which players were picked
    //nothing else, maybe display confirmation that player_x & player_y were switched
  }
  drunk() {
    //display cards in the center for picking 1 to switch with players card
    //Send Server which center card was selected
    //nothing else, maybe display confirmation that centerCard_x was swtiched with drunk
  }
  insomniac() {
    //Funny message or sunsetting and rising till all night actions are completed.
    //display day - role
  }

  makeSelection = (selectionLabel, isPlayer) => {
    let { selectedCards, selectedPlayers } = this.state;

    if (isPlayer) {
      selectedCards = [];
      if (!selectedPlayers.includes(selectionLabel)) {
        selectedPlayers.push(selectionLabel);
        if (selectedPlayers.length > 1) {
          selectedPlayers.shift();
        }
      } else {
        selectedPlayers = selectedPlayers.filter(player => player !== selectionLabel);
      }
    } else {
      selectedPlayers = [];
      if (!selectedCards.includes(selectionLabel)) {
        selectedCards.push(selectionLabel);
        if (selectedCards.length > 2) {
          selectedCards = selectedCards.filter(card => card === selectionLabel);
        }
      } else {
        selectedCards = selectedCards.filter(card => card !== selectionLabel);
      }
    }

    this.setState({ selectedCards, selectedPlayers });
  };

  emphasizeText = (text) => <Text style={styles.emphasis}>{text}</Text>;

  render() {
    const { players, player, role, markAsReady, messageForPlayer, centerRoles } = this.props;
    const { rolePrompt, roleDescription, displayMiddleCards, centerRolesStub, selectedCards, selectedPlayers } = this.state;

    // seer() {
    //display option to pick from player or look at 2 in the center
    //Send server which player or which center cards were selected
    //display player role or picked center cards roles
    // }

    const selectablePlayers = players.filter(p => p.id !== player.id);

    return (
      <View style={styles.container}>
        <Button style={styles.unSelectedButton} onPress={() => {markAsReady(); this.setState({ displayMiddleCards: true });}} title="Ready" />
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
        {role.name === 'seer' && (
          <>
            <PlayerSelectionAction players={selectablePlayers} onSelection={this.makeSelection} selected={selectedPlayers}/>
            <CenterCards centerRoles={centerRolesStub} onSelection={this.makeSelection} selected={selectedCards}/>
          </>
        )}
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
