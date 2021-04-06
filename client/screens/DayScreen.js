import * as React from 'react';
import { Button, Text, View } from 'react-native';
import PlayerSelectionAction from '../components/PlayerSelectionAction';
import CountDownTimer from '../components/CountDownTimer';
import { updateSelections } from "../assets/GameUtil";
import Peek from "../components/Peek";
import {Styles} from "../constants/Themes";

export default class DayScreen extends React.Component {
  constructor(props) {
    super(props);

    const { messageForPlayer } = props;

    this.state = {
      buttonText: 'Vote Now',
      daytimeMessage: messageForPlayer,
      peekOpen: false,
      selectedPlayers: [],
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

  makeSelection = (selectionLabel) => {
    let { selectedPlayers } = this.state;

    selectedPlayers = updateSelections(1, selectedPlayers, selectionLabel);

    this.setState({ selectedPlayers });
  };

  updateButtonText = () => {
    this.setState({ buttonText: 'Time is up!' });
  };

  render() {
    const { handleVoteAction, player, players, results } = this.props;
    const { buttonText, daytimeMessage, peekOpen, selectedPlayers } = this.state;

    const selectablePlayers = players.filter(p => p.id !== player.id);

    const vote = (
      //Display the list of players to vote for ONCE ALL PLAYERS ARE READY
      <>
        {daytimeMessage !== '' && (
          <Peek
            title="Your Night Choice"
            message={daytimeMessage}
            isOpen={peekOpen}
            onOpen={this.handleOpenPeek}
            onClose={this.handleClosePeek}
          />
        )}
        <PlayerSelectionAction
          players={selectablePlayers}
          onSelection={this.makeSelection}
          selected={selectedPlayers}
        />
        <Button
          title={buttonText}
          style={Styles.unSelectedButton}
          onPress={() => {
            console.debug(`You voted to kill: ${selectedPlayers}`);
            handleVoteAction(selectedPlayers);
          }}
        />
        <CountDownTimer
          style={Styles.activeText}
          firstText='You have '
          secondText=' seconds to vote.'
          time={20}
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
          <Text style={Styles.getStartedText}>Results: {results} was killed!</Text>
          ) : (
            vote
          )
        }
      </View>
    );
  }
}
