import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { Client } from "colyseus.js";
import { roleDefinitions } from "../constants/RoleDefinitions";
import OptionButton from '../components/OptionButton';


class RoleSelectionScreen extends React.Component {
  static propTypes = {
  };

  constructor(props) {
    super(props);

    this.state = {
      roles: [],
      activeRoles: [],
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

  //TODO ActiveRoles get from Serverside
  loadRoles = async () => {
    const gameRoles = this.room.state.roles;
    console.debug(`${gameRoles}`);

    // this.setState({ roleDefinitions: roleDefinitions });
    let roles = [];

    for (let id in gameRoles) {
      let role = gameRoles[id];
      roles.push({ id, ...role });
    }

    // Object.entries(roleDefinitions).map(([role, definition]) => {
    //   if (definition.maximum > 1) {
    //     //create a new roleID for each number of roles that can exist
    //     for (let i = 0; i < definition.maximum; i++) {
    //       let roleID = role + i;
    //       roles.push({ ...definition, name: role, id: roleID });
    //     }
    //   } else {
    //     roles.push({ ...definition, name: role, id: `${role}0` });
    //   }
    // });

    roles.sort((a, b) => {
      a = a.wakeOrder;
      b = b.wakeOrder;

      if (a === -1 && b === -1) return 0;
      else if (a === -1) return 1;
      else if (b === -1) return -1;

      if (a === b) return 0;
      else if (a > b) return 1;
      else return -1;
    });
    // this.setState((s) => { roles: s.room.roles });
    this.setState({ roles });
  }

  // LIFECYCLE
  start = async () => {
    // Connect
    try {
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? '2567' : window.location.port;
      const url = window.location.protocol.replace('http', 'ws') + "//" + host + (port ? ':' + port : '');

      this.client = new Client(url);
      this.room = await this.client.joinOrCreate('my_room')

      this.setState({
        playerId: this.room.sessionId,
      });

      // const gameRoles = this.room.state.roles;
      // console.debug(`${gameRoles}`);

      //Client-side callbacks
      //https://docs.colyseus.io/state/schema/#onchange-changes-datachange
      this.room.state.onChange = (changes) => {
        changes.forEach(change => {
          console.debug(change.field);
          console.debug(change.value);
          console.debug(change.previousValue);
        });
      };

      this.room.onStateChange(state => {
        this.loadRoles();
        // for (let id in state.roles) {
        //   let role = state.roles[id];
        //   console.debug(`This Role is trying to ouput`);
        // }
      });

      // Listen for Messages
      this.room.onMessage(this.handleMessage);

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

  activateRole = (roleID) => {
    //These are the roles selected to play
    const gameRoles = this.room.state.roles;
    console.debug(`${gameRoles}`);

    //toggle the role
    let roleToggle;

    for (let id in gameRoles) {
      if (id === roleID) {
        let role = gameRoles[id];
        //reverse whatever state it is in on the server
        roleToggle = !role.active;
      }
    }

    let request = {
      action: 'updateSelectedRole',
      params: {
        roleID: roleID,
        roleEnabled: roleToggle
      }
    };
    //Send the 'request' to set the role active or !active
    this.room.send(request);

    //Listen for Roles Contatiner state changes
    //Client-side callback within a container AKA:MapSchema
    //https://docs.colyseus.io/state/schema/#onchange-instance-key
    this.room.state.roles.onChange = (role, roleID) => {
      console.debug(`${role} is now ${roleID}`);
      console.debug(`${roleID}.active is now ${role.active}`);
    };
  };

  render() {
    const { roles, activeRoles } = this.state;

    //TODO Display roles from server state.. (i.e. minion should show 1 werewolf activated)
    //TODO ^ getting this from joinedRoom in start
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
            {roles.map(role => (
              <TouchableOpacity key={role.id} style=
                {role.active ? styles.selectedButtonStyle : styles.unSelectedButton}>
                <OptionButton
                  icon={role.name + "-token"}
                  label={role.name}
                  onPress={() => {
                    this.activateRole(role.id);
                    // room.send(role.name);
                    console.log(activeRoles);
                    console.log(role.name)
                  }}
                // onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
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
    backgroundColor: '#939FA0',
    paddingHorizontal: 5,
    paddingVertical: 5,
    // borderWidth: StyleSheet.hairlineWidth,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.buttonSelectedBorder,
    color: Colors.inactiveText,
  },
  unSelectedButton: {
    backgroundColor: Colors.buttonBackground,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.borderWidth,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
