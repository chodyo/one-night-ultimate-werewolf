import * as React from 'react';
import {Button, Platform, StatusBar, StyleSheet, View} from 'react-native';
import { Client } from 'colyseus.js';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { NightTheme } from "./constants/Colors";
import HomeScreen from "./screens/HomeScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import {ScrollView} from "react-native-gesture-handler";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = new Client('ws://localhost:2567');
    this.room = null;

    this.state = {
      isLoadingComplete: false,
      initialNavigationState: null,
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
      this.room.onMessage(whatever => console.debug('some message from client:', whatever));
    } catch (e) {
      console.error('Fucked in App by:', e);
    } finally {
      this.setState({ isLoadingComplete: true });
    }
  }

  alertStart = () => {
    console.debug('Someone pressed start!');
  };

  render() {
    const { isLoadingComplete } = this.state;

    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <Button style={styles.unSelectedButton} onPress={() => this.alertStart()} title="Start Game" />
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default"/>}
            <HomeScreen room={this.room} />
            <RoleSelectionScreen room={this.room} />
          </ScrollView>
        </View>
      );
    }
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NightTheme.darkBlue,
  },
});
