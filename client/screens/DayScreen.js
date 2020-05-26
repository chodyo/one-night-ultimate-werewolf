import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NightTheme } from "../constants/Colors";
import PlayerSelectionAction from '../components/PlayerSelectionAction';
import CountDownTimer from '../components/CountDownTimer';
import { updateSelections } from "../assets/GameUtil";

export default class DayScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPlayers: [],
      buttonText: 'Vote Now'
    };
  }

  makeSelection = (selectionLabel) => {
    let { selectedPlayers } = this.state;

    selectedPlayers = updateSelections(1, this.state.selectedPlayers, selectionLabel);

    this.setState({ selectedPlayers });
  };

  updateButtonText = () => {
    this.setState({ buttonText: 'Time is up!' });
  }

  render() {
    const { players, player, handleVoteAction, results } = this.props;
    const { selectedPlayers, buttonText } = this.state;

    const selectablePlayers = players.filter(p => p.id !== player.id);

    const vote = (
      //Display the list of players to vote for ONCE ALL PLAYERS ARE READY
      <>
        <Button
          title={buttonText}
          style={styles.unSelectedButton}
          onPress={() => {
            console.debug(`You voted to kill: ${selectedPlayers}`);
            handleVoteAction(selectedPlayers);
          }}
        />
        <CountDownTimer
          style={styles.activeText}
          firstText='You have '
          secondText=' seconds to vote.'
          time={6}
          timeIsOver={() => handleVoteAction(selectedPlayers)}
        />
        <PlayerSelectionAction
          players={selectablePlayers}
          onSelection={this.makeSelection}
          selected={selectedPlayers}
        />
      </>
    );

    //Display results if server has updated them
    //Who voted(killed) who
    //Player's starting:ending role
    //Winning Team
    //<Text style={styles.getStartedText}> TODO Results: [Player-starting role, ending role]</Text>
    return (
      <View>
        {results !== '' ? (
          <Text style={styles.getStartedText}>Results: {results} was killed!</Text>
        ) : (
            vote
          )}
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
    alignItems: 'center',
  },
  selectedButtonStyle: {
    backgroundColor: NightTheme.buttonSelected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonSelectedBorder,
    borderRadius: '10px',
    alignItems: 'center',
  },
  unSelectedButton: {
    backgroundColor: NightTheme.buttonUnselected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonUnselected,
    borderRadius: '10px',
    alignItems: 'center',
  },
  optionText: {
    color: NightTheme.buttonText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
    // alignSelf: 'flex-start',
    // marginTop: 1,
  },
});
