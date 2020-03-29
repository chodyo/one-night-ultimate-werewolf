import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Image, TextInput, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { Button } from 'react-native-web';

const onuwRoles = [
  'doppelganger',
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
  'werewolf'
];

class RoleSelectionScreen extends Component {

  static propTypes = {
    //    room: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      activeRoles: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    try {
      //      await this.getRoles();
      this.setState({ onuwRoles });
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
            {roles.length > 0 && roles.map(role => {
              <Button onPress={() => { this.activateRole }} title={role} />
            })}
          </View>
        </ScrollView>
        {/* <Button onPress={} title="Start Game" /> */}
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
