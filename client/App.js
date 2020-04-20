import * as React from 'react';
import {Button, Platform, StatusBar, StyleSheet, View} from 'react-native';
import { Client } from 'colyseus.js';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { NightTheme } from "./constants/Colors";
import HomeScreen from "./screens/HomeScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import {ScrollView} from "react-native-gesture-handler";
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
      if (player.sessionId === this.client.sessionId) {
        playerRole = player.role;
        clientPlayer = player
      }
    }

    this.setState({ phase, clientPlayer, playerRole });
  };

  startGame = () => {
    console.debug('Someone pressed start!');
    this.room.send({ action: 'startGame' });
  };

  render() {
    const { clientPlayer, isLoadingComplete, phase, playerRole } = this.state;

    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {phase === 'daytime' &&
              <View>
                <Button style={styles.unSelectedButton} onPress={() => this.startGame()} title="Start Game" />
                <HomeScreen room={this.room} />
                <RoleSelectionScreen room={this.room} />
              </View>
            }
            {phase === 'nighttime' &&
              <View>
                <NightScreen player={clientPlayer} role={playerRole}/>
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
