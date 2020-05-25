import * as React from 'react';
import { Button, StyleSheet, View, Text } from 'react-native';
import { Client } from 'colyseus.js';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { NightTheme } from "./constants/Colors";
import HomeScreen from "./screens/HomeScreen";
import RoleSelection from "./components/RoleSelection";
import { ScrollView } from "react-native-gesture-handler";
import NightScreen from "./screens/NightScreen";
import DayScreen from "./screens/DayScreen";

import Notification from "./components/Notification";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = new Client('ws://localhost:2567');
    this.room = null;

    this.state = {
      isLoadingComplete: false,
      initialNavigationState: null,
      phase: '',
      clientPlayer: null,
      playerRole: null,
      // allPlayersReady: false,
      players: [],
      roles: [],
      serverMessage: '',
      centerRoles: null,
      results: '',
    };
  }

  async componentDidMount() {
    try {
      await Font.loadAsync({
        ...Ionicons.font,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),

      });
      await Font.loadAsync({
        'werewolf': require('./assets/fonts/Werewolf.ttf'),
      });

      this.room = await this.client.joinOrCreate('my_room');
      this.room.onStateChange(() => this.loadState());
      await this.handleMessage();
      this.room.onMessage(whatever => console.debug('some message from client:', whatever));
    } catch (e) {
      console.error('Fucked in the App by:', e);
    } finally {
      this.setState({ isLoadingComplete: true });
    }
  }

  loadState = async () => {
    const { centerRoles, phase, players } = this.room.state;

    let clientPlayer, playerRole;
    let playersArray = [];
    for (let id in players) {
      let player = players[id];
      playersArray.push({ id: id, ...player });

      // find this client's player role
      // then display their role to them if the client === player
      if (id === this.room.sessionId) {
        clientPlayer = { id: id, ...player };
        playerRole = player.role;
      }
    }

    this.setState({ phase, clientPlayer, playerRole, players: playersArray, centerRoles });
  };

  handleMessage = async () => {
    await this.room.onMessage((message) => {
      this.setState({ serverMessage: message.message });
      console.log(`Server sent: ${message.message}`);
    });
  };

  markAsReady = () => {
    const { state: { players }, sessionId } = this.room;
    console.debug(`${players[sessionId].name} is ready!`);

    this.room.send({ action: 'ready' });
  };

  handleNightAction = (selectedCards, selectedPlayers) => {
    const { state: { players }, sessionId } = this.room;
    console.debug(`${players[sessionId].name} is voting!`);

    this.room.send({
      action: 'updateNightChoices',
      params: {
        selectedCards: selectedCards,
        selectedPlayers: selectedPlayers,
      },
    });

    //Setting state here for now to render the screens
    //Once this is functional on the server TODO: REMOVE
    this.setState({ phase: 'daytime' });
  };

  handleVoteAction = (selectedPlayers) => {
    const { state: { players }, sessionId } = this.room;
    console.debug(`${players[sessionId].name} voted!`);

    this.room.send({
      action: 'updateVoteChoices',
      params: {
        selectedPlayers: selectedPlayers,
      },
    });

    //Set state here for now to render the screens
    //Once this is functional on the server TODO: REMOVE
    this.setState({ results: selectedPlayers[0] });
    //Send the players VOTE to the server
    // this.room.send({ action: 'ready' });
  };

  closeNotification = () => {
    this.setState({ serverMessage: '' });
  };

  render() {
    const {
      isLoadingComplete,
      phase,
      players,
      clientPlayer,
      playerRole,
      serverMessage,
      centerRoles,
      results,
    } = this.state;

    let message = serverMessage;

    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <Notification
            message={serverMessage} onClose={this.closeNotification}
          />
          <ScrollView style={styles.getStartedContainer}>
            {phase === 'prep' &&
              <View style={{ alignItems: 'center' }}>
                <Button
                  title="I'm ready!"
                  style={styles.unSelectedButton}
                  onPress={() => this.markAsReady()}
                  disabled={clientPlayer.ready}
                />
                {serverMessage !== '' &&
                  <Text style={styles.getStartedInputsText}>Message: {serverMessage}</Text>
                }
                <HomeScreen room={this.room} players={players} />
                <RoleSelection room={this.room} />
              </View>
            }
            {phase === 'nighttime' &&
              <View>
                <NightScreen
                  players={players}
                  player={clientPlayer}
                  role={playerRole}
                  messageForPlayer={serverMessage}
                  centerRoles={centerRoles}
                  handleNightAction={this.handleNightAction}
                />
              </View>
            }
            {phase === 'daytime' &&
              <View style={{ alignItems: 'center' }}>
                <DayScreen
                  players={players}
                  player={clientPlayer}
                  handleVoteAction={this.handleVoteAction}
                  results={results}
                />
              </View>
            }
          </ScrollView>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NightTheme.darkBlue,
  },
  getStartedInputsText: {
    fontSize: 24,
    color: NightTheme.inputText,
    // lineHeight: 24,
  },
});
