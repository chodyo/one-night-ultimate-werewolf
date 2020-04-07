import * as React from 'react';
import PropTypes from 'prop-types';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import { NightTheme } from "./constants/Colors";
import { Client } from "colyseus.js";

const Stack = createStackNavigator();

class App extends React.Component {
  static propTypes = {
    skipLoadingScreen: PropTypes.bool,
  };

  static defaultProps = {
    skipLoadingScreen: true,
  };

  constructor(props) {
    super(props);

    this.container = null;

    this.state = {
      isLoading: false,
      navigation: null,
      client: null,
      room: null,
    };
  }

  async componentDidMount() {
    await this.start();
  }

  componentWillUnmount() {
    this.stop();
  }

  start = async () => {
    let navigation, room;
    try {
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? '2567' : window.location.port;
      const url = window.location.protocol.replace('http', 'ws') + '//' + host + (port ? ':' + port : '');

      this.client = new Client(url);
      room = await this.client.joinOrCreate('my_room');

      navigation = await useLinking(this.container);

      SplashScreen.preventAutoHide();

      // Load fonts
      await Font.loadAsync({
        ...Ionicons.font,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),

      });
      await Font.loadAsync({
        'werewolf': require('./assets/fonts/Werewolf.ttf'),
      });

      // this.room.onStateChange(state => this.loadPlayers(state));
    } catch (e) {
      // We might want to provide this error information to an error reporting service
      console.warn('Fucked by:', e);
    } finally {
      this.setState({ isLoading: true, navigation, room });
      SplashScreen.hide();
    }
  };

  stop = () => {
    // Colyseus
    if (this.room) {
      this.room.leave();
    }
  };
  //
  // loadPlayers = async (state) => {
  //   const serverPlayers = state.players;
  //
  //   let players = [];
  //   for (let id in serverPlayers) {
  //     let player = serverPlayers[id];
  //     players.push({ id: id, ...player });
  //   }
  //
  //   this.setState({ players });
  // };

  registerContainerRef = (element) => {
    this.container = element;
  };

  render() {
    const { isLoading, navigation, room } = this.state;
    // const { client, room } = this.props;

    console.debug("Client is: ", this.client);
    console.debug("Room is: ", room);

    if (isLoading && !this.props.skipLoadingScreen) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer ref={this.registerContainerRef} initialState={navigation}>
            <Stack.Navigator>
              <Stack.Screen name="Root" component={BottomTabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
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

export default App;
