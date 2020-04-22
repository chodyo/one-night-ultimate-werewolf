import * as React from 'react';
import { Button, Platform, StatusBar, StyleSheet, View, Text } from 'react-native';
import { Client } from 'colyseus.js';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { NightTheme } from "./constants/Colors";
import HomeScreen from "./screens/HomeScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import { ScrollView } from "react-native-gesture-handler";
import NightScreen from "./screens/NightScreen";

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
      roles: [],
      serverMessage: '',
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
    const { phase, players } = this.room.state;

    let clientPlayer, playerRole;
    for (let id in players) {
      let player = players[id];
      // find this client's player role
      // then display their role to them if the client === player
      if (id === this.room.sessionId) {
        clientPlayer = player;
        playerRole = player.role;
      }
    }

    this.setState({ phase, clientPlayer, playerRole });
  };

  startGame = () => {
    this.room.send({ action: 'startGame' });
    // this.room.onMessage((message) => {
    //   console.log(`Server sent: ${message.message}`);
    // });
  };

  handleMessage = async () => {
    await this.room.onMessage((message) => {
      this.setState({ serverMessage: message.message });
      console.log(`Server sent: ${message.message}`);
    });
  }

  markAsReady = () => {
    const { state: { players }, sessionId } = this.room;
    console.debug(`${players[sessionId].name} is ready!`)
    // this.room.send({ action: 'ready' });
  };

  render() {
    const { isLoadingComplete, phase, clientPlayer, playerRole, serverMessage } = this.state;

    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.getStartedContainer}>
            {phase === 'daytime' &&
              <View style={{ alignItems: 'center' }}>
                <Button style={styles.unSelectedButton} onPress={() => this.startGame()} title="Start Game" />
                {serverMessage !== '' &&
                  <Text style={styles.getStartedInputsText}>Message: {serverMessage}</Text>
                }
                <HomeScreen room={this.room} />
                <RoleSelectionScreen room={this.room} />
              </View>
            }
            {phase === 'nighttime' &&
              <View>
                <NightScreen
                  player={clientPlayer}
                  role={playerRole}
                  messageForPlayer={serverMessage}
                  markAsReady={this.markAsReady}
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
    textAlign: 'center',
  },
});
