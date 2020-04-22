import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NightTheme } from "../constants/Colors";
import RolePanel from "../components/RolePanel";
import PlayerSelectionAction from '../components/PlayerSelectionAction';

export default class NightScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rolePrompt: '',
      roleDescription: '',
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
  seer() {
    //display option to pick from player or look at 2 in the center
    //display players to pick from 
    //Send server which player was picked
    //display player role
    //display center cards in the center for picking 2 to look at
    //Send Server which center cards were looked at
    //Display selected cards

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

  emphasizeText = (text) => <Text style={styles.emphasis}>{text}</Text>;

  render() {
    const { players, player, role, markAsReady, messageForPlayer } = this.props;
    const { rolePrompt, roleDescription } = this.state;

    return (
      <View style={styles.container}>
        <Button style={styles.unSelectedButton} onPress={() => markAsReady()} title="Ready" />
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
        {messageForPlayer !== '' &&
          <Text style={styles.getStartedText}>
            Yo!: {messageForPlayer}
          </Text>
        }
        <PlayerSelectionAction players={players}></PlayerSelectionAction>
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
