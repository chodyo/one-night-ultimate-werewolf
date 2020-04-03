import React from 'react';
import PropTypes from 'prop-types'
import { Button, Image, Platform, StyleSheet, Text, View, TouchableHighlight, AsyncStorage } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { Client, Room } from "colyseus.js";
import { roleDefinitions } from "../constants/RoleDefinitions";
import OptionButton from '../components/OptionButton';


class RoleSelectionScreen extends React.Component {
  static propTypes = {
  };

  constructor(props) {
    super(props);

    this.state = {
      roleDefinitions: null,
      activeRoles: [],
      room: null,
    };
  }

  async componentDidMount() {
    console.debug('Starting Mount');
    await this.start();
    await this.loadRoles();
  }

  componentWillUnmount() {
    this.stop();
  }

  async loadRoles() {
    // const { room } = this.state;
    this.setState({ roleDefinitions: roleDefinitions });
  }
  // LIFECYCLE
  start = async () => {
    console.debug("LIFECYCLE");
    const {
      roomId = '',
      location: {
        search = '',
      } = {},
    } = this.props;

    const isNewRoom = roomId === 'new';

    console.debug(isNewRoom, roomId);

    let options;
    if (isNewRoom) {
      console.debug('NEW ROOM!');
      options = {
      };
    } else {
      // The only thing to pass when joining an existing room is a player's name
      console.debug('Not a new ROOM!');

      options = {
        playerName: localStorage.getItem('playerName'),
      };
      console.debug(options);

    }

    // Connect
    try {
      const host = window.document.location.host.replace(/:.*/, '');
      console.debug(host);
      const port = process.env.NODE_ENV !== 'production' ? '2567' : window.location.port;
      console.debug(port);
      const url = window.location.protocol.replace('http', 'ws') + "//" + host + (port ? ':' + port : '');
      console.debug(url);

      this.client = new Client(url);
      console.debug('the url');
      console.debug(url);
      await this.client.joinOrCreate('my_room').then(joinedRoom => {
        console.debug(`joined room`, joinedRoom);

        this.setState({
          room: joinedRoom,
          playerId: joinedRoom.sessionId,
        });
      });

      //   if (isNewRoom) {
      //     this.room = await this.client.create(Constants.ROOM_NAME, options);

      //     // We replace the "new" in the URL with the room's id
      //     window.history.replaceState(null, '', `/${this.room.id}`);
      //     console.debug("fucking Unicorns!");
      //   } else {
      //     this.room = await this.client.joinById(roomId, options);
      //     console.debug("fucking Unicorns!");

      //   }
    } catch (error) {
      console.error("Fucked by ", error);
    }
  };

  stop = () => {
    // Colyseus
    if (this.room) {
      this.room.leave();
    }
  };

  activateRole = (roletoggle) => {
    //These are the roles selected to play
    const { activeRoles, room } = this.state;
    //New list of roles which checks whether to add or remove the role to Active Roles selected to play
    // let newRoles = roleExists ? activeRoles.filter(role => roletoggle !== role) : activeRoles.concat(roletoggle);
    let request = {
      action: 'updateSelectedRole',
      params: {
        roleId: roletoggle,
        //Check whether the clicked role has already been selected (or exists in active roles)
        roleEnabled: !activeRoles.includes(roletoggle)
      }};
    //Updates Active Roles to the expected roles to include
    room.send(request);
    // this.setState({ activeRoles: newRoles });
  };

  render() {
    const { activeRoles } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.unSelectedButton}>
            <Text style={styles.getStartedText}>
              Select which roles you wish to include:
            </Text>
            {Object.entries(roleDefinitions).map(([role, definition]) => (
              <TouchableOpacity key={role} style={activeRoles.includes(role) ? styles.selectedButtonStyle : styles.unSelectedButton}>
                <OptionButton
                  icon={definition.imageToken}
                  label={role}
                  onPress={() => this.activateRole(role) }
                />
              </TouchableOpacity>
            ))}

          </View>
        </ScrollView>
        <Button style={styles.unSelectedButton} onPress={() => this.activateRole(null)} title="Start Game" />
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
    alignItems: 'center',
    flex: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 30,
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
  selectedButtonStyle: {
    textAlign: 'center',
    backgroundColor: '#939FA0',
    paddingHorizontal: 5,
    paddingVertical: 5,
    // borderWidth: StyleSheet.hairlineWidth,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.buttonSelectedBorder,
    color: Colors.inactiveText,
  },
  unSelectedButton: {
    textAlign: 'center',
    backgroundColor: Colors.buttonBackground,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.borderWidth,
    color: Colors.activeText,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
