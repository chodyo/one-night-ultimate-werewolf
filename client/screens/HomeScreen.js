import * as React from 'react';
import {Button, TextInput, StyleSheet, Text, View} from 'react-native';
import {NightTheme} from "../constants/Colors";

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerId: '',
      playerName: '',
      players: [],
    };
  }

  async componentDidMount() {
    console.debug('Loading HomeScreen');
    await this.start();
  }

  start = async () => {
    try {
      this.props.room.onStateChange(state => this.loadPlayers(state));
    } catch (error) {
      console.error('Home screen fucked by:', error)
    }
  };

  loadPlayers = async (state) => {
    const serverPlayers = state.players;

    let players = [];
    for (let id in serverPlayers) {
      let player = serverPlayers[id];
      players.push({id: id, ...player});
    }

    this.setState({players});
  };

  setPlayerName = () => {
    const {playerName} = this.state;

    let request = {
      action: 'setPlayerName',
      params: {name: playerName},
    };

    this.props.room.send(request);

    this.setState({playerName: ''});
  };

  render() {
    const {playerName, players} = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.getStartedContainer}>
          <Text style={styles.getStartedText}>Enter player name:</Text>
          <TextInput
            placeholder="your name..."
            style={styles.getStartedInputsBox}
            onChangeText={text => this.setState({playerName: text})}
            value={playerName}
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
      </View>
    );
  }
}

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
