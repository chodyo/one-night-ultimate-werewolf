import React from 'react';
import PropTypes from 'prop-types'
import { Button, Image, TextInput, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import Colyseus from 'colyseus.js'
import { AsyncStorage } from 'react-native';
import { Buffer } from “buffer”;

// import { render, findDOMNode } from 'react-dom';

const onuwRoles = [
  'doppelganger',
  'werewolf',
  'drunk',
  'hunter',
  'insomniac',
  'mason',
  'minion',
  'robber',
  'seer',
  'tanner',
  'troublemaker',
  'villager',
];

class RoleSelectionScreen extends React.Component {

  static propTypes = {
    //    room: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);

    window.localStorage = AsyncStorage;
    global.Buffer = Buffer;

    // use current hostname/port as colyseus server endpoint
    var endpoint = location.protocol.replace("http", "ws") + "//" + location.hostname;

    // development server
    if (location.port && location.port !== "80") { endpoint += ":2657" }

    this.colyseus = new Colyseus(endpoint)
    this.chatRoom = this.colyseus.join('chat', { channel: window.location.hash || "#default" })
    this.chatRoom.on('update', this.onUpdateRemote.bind(this))

    this.state = {
      roles: [],
      activeRoles: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    try {
      //      await this.getRoles();
      this.setState({ roles: onuwRoles });
    }
    catch (e) {
      console.error('Could not retrieve roles.');
    }
  }

  async getRoles() {
    //    const { roles } = this.props.room;

    this.setState({ onuwRoles });
  }

  activateRole = (role) => {
    this.setState((s) => { s.activeRoles.push(role) });
  }

  render() {
    const { roles, activeRoles } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>
              Select which roles you wish to include:
            </Text>
            {roles.map(role => (
              <Button id={role} onPress={() => { this.activateRole() }} title={role} />
            ))}

          </View>
        </ScrollView>
        <Button onPress={() => this.activateRole(null)} title="Start Game" />
      </View>
    );
  }
}

export default RoleSelectionScreen;

RoleSelectionScreen.navigationOptions = {
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
