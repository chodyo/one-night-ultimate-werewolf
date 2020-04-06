import * as React from 'react';
import { Button, Image, TextInput, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors, { NightTheme } from "../constants/Colors";
import { Client } from 'colyseus.js';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerId: '',
      playerName: '',
      players: [],
    };
  }

  async componentDidMount() {
    console.debug('Starting Mount');
    await this.start();
  }

  componentWillUnmount() {
    this.stop();
  }

  start = async () => {
    try {
      // Colyseus client setup
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? '2567' : window.location.port;
      const url = window.location.protocol.replace('http', 'ws') + '//' + host + (port ? ':' + port : '');

      this.client = new Client(url);
      this.room = await this.client.joinOrCreate('my_room');

      this.room.onStateChange(state => this.loadPlayers(state));
    } catch (error) {
      console.error('Home screen fucked by:', error)
    }
  };

  stop = () => {
    // Colyseus
    if (this.room) {
      this.room.leave();
    }
  };

  loadPlayers = async (state) => {
    const serverPlayers = state.players;

    let players = [];
    for (let id in serverPlayers) {
      let player = serverPlayers[id];
      players.push({ id: id, ...player });
    }

    this.setState({ players });
  };

  setPlayerName = () => {
    const { playerName } = this.state;

    let request = {
      action: 'setPlayerName',
      params: { name: playerName },
    };

    this.room.send(request);
  };

  render() {
    const { players } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/images/werewolf.png')}
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Enter player name:</Text>
            <TextInput
              placeholder="your name..."
              style={styles.getStartedInputsBox}
              onChangeText={text => this.setState({ playerName: text })}
            />
            <Button
              title="Submit"
              color={NightTheme.buttonBackground}
              onPress={() => this.setPlayerName()}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Players:</Text>
            {players.map(player => (
              <Text key={player.id} style={styles.getStartedInputsText}>{player.name ? player.name : '...'}</Text>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default HomeScreen;

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NightTheme.darkBlue,
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    resizeMode: 'contain',
    marginTop: 3,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 30,
    color: NightTheme.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
  getStartedInputsBox: {
    fontSize: 24,
    color: NightTheme.inputText,
    // lineHeight: 24,
    textAlign: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  getStartedInputsText: {
    fontSize: 24,
    color: NightTheme.inputText,
    // lineHeight: 24,
    textAlign: 'center',
  },
});
