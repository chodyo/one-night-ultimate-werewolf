import * as React from 'react';
import { Button, Platform, StatusBar, StyleSheet, View } from 'react-native';
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
      roles: []
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
  };

  markAsReady = () => {
    const { state: { players }, sessionId } = this.room;
    console.debug(`${players[sessionId].name} is ready!`)
    // this.room.send({ action: 'ready' });
  };

  render() {
    const { isLoadingComplete, phase, clientPlayer, playerRole } = this.state;

    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.getStartedContainer}>
            {phase === 'daytime' &&
              <View style={{ alignItems: 'center' }}>
                <Button style={styles.unSelectedButton} onPress={() => this.startGame()} title="Start Game" />
                <HomeScreen room={this.room} />
                <RoleSelectionScreen room={this.room} />
              </View>
            }
            {phase === 'nighttime' &&
              <View>
                <NightScreen player={clientPlayer} role={playerRole} markAsReady={this.markAsReady} />
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
});
