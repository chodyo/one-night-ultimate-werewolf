import * as React from 'react';
import { Client } from 'colyseus.js';
import { Button, Image, TextInput, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from "../constants/Colors";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerId: '',
      playerName: '',
      players: [],
    };
  }

  componentDidMount() {
    this.start();
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

      // this.setState({
      //   playerId: this.room.sessionId,
      // });

      console.debug(`Players in the room: ${this.room.state.players}`);
      this.room.state.players.onChange = (player, key) => console.log(player, "have changes at", key);
      // this.room.onStateChange(() => this.loadPlayers());
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

  loadPlayers = async () => {
    const { playerId } = this.state;
    const serverPlayers = this.room.state.players;

    let players = [];
    for (let p in serverPlayers) {
      let player = serverPlayers[p];
      players.push({ player });

      if (!player.name) {
        player.name = player.sessionId;
      }
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
              placeholder="What shall we call you?"
              onChangeText={playerName => this.setState({ playerName })}
            />
            <Button onPress={() => this.setPlayerName()} title="Submit" />
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Players:</Text>
            {players.map(player => (
              <Text key={player.sessionId} style={styles.getStartedText}>{player.name}</Text>
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
    backgroundColor: Colors.werewolfBlue,
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
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 30,
    color: Colors.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
