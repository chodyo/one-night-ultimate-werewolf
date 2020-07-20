import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { Styles } from "../constants/Themes";
import CountDownTimer from '../components/CountDownTimer';
import { updateSelections } from "../assets/GameUtil";
import PlayerSelectionAction from '../components/PlayerSelectionAction';


export default class ConfirmRole extends React.Component {
  constructor(props) {
    super(props);

    const { players, player, role } = props;
    let maxPlayers = 0;
    const doppelgangerIsPlayer = players.filter(p => p.id !== player.id && p.role.name === 'doppelganger').length === 0;

    this.state = {
      actionRequiredRoleDefault: true,
      actionRequired: true,
      selectedPlayers: [],
      buttonText: 'Ready'
    };
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
      console.error('Fucked in the confirmation by:', e);
    }
  }

  makeSelection = (selectionLabel) => {

    let { selectedPlayers, maxPlayers } = this.state;

    let actionRequired;
    selectedPlayers = updateSelections(maxPlayers, selectedPlayers, selectionLabel);
    actionRequired = this.isActionRequired(maxPlayers, selectedPlayers);

    this.setState({ selectedPlayers, actionRequired });
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

  updateButtonText = () => {
    this.setState({ buttonText: 'Time is up!' });
  };

  render() {
    const { players, player, role, handleSelection, markAsReady } = this.props;
    const {
      selectedPlayers,
      actionRequiredRoleDefault,
      centerCards,
    } = this.state;

    const selectablePlayers = players.filter(p => p.id !== player.id);


    const confirmRole_Ready = (
      //Countdown till game play for any player that isn't the
      <>
        <CountDownTimer
          style={Styles.activeText}
          firstText='You have '
          secondText=' seconds to ready.'
          time={15}
          timeIsOver={() => markAsReady()}
        />
      </>
    );

    return (
      <View>
        <Button
          title={'Ready'}
          style={Styles.unSelectedButton}
          onPress={() => {
            player.role.name === 'doppelganger' ?
              handleSelection(selectedPlayers) : markAsReady;
          }}
        />
        {player.role.name === 'doppelganger' ? (
          <>
            <Text style={Styles.getStartedText}>You are the doppelganger</Text>
            <PlayerSelectionAction
              players={selectablePlayers}
              onSelection={this.makeSelection}
              selected={selectedPlayers}
            />
          </>
        ) : (
            confirmRole_Ready
          )}
      </View>
    );
  }
};

