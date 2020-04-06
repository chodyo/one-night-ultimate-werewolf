import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { Client } from "colyseus.js";
import RoleButton from "./RoleButton";
import RoleGroup from "./RoleGroup";

class RoleSelectionScreen extends React.Component {
  static propTypes = {
  };

  constructor(props) {
    super(props);

    this.state = {
      roles: [],
      duplicateRoles: {
        werewolf: [],
        mason: [],
        villager: [],
      },
    };
  }

  async componentDidMount() {
    console.debug('Starting Mount');
    await this.start();
  }

  componentWillUnmount() {
    this.stop();
  }

  // LIFECYCLE
  start = async () => {
    // Connect
    try {
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? '2567' : window.location.port;
      const url = window.location.protocol.replace('http', 'ws') + '//' + host + (port ? ':' + port : '');

      this.client = new Client(url);
      this.room = await this.client.joinOrCreate('my_room');

      //Client-side callbacks
      //https://docs.colyseus.io/state/schema/#onchange-changes-datachange
      // this.room.state.onChange = (changes) => {
      //   changes.forEach(change => {
      //     console.debug(change.field);
      //     console.debug(change.value);
      //     console.debug(change.previousValue);
      //   });
      // };

      this.room.onStateChange(() => this.loadRoles());
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

  loadRoles = async () => {
    const gameRoles = this.room.state.roles;

    let roles = [];
    let werewolfRoles = [];
    let masonRoles = [];
    let villagerRoles = [];
    for (let id in gameRoles) {
      let role = gameRoles[id];

      if (role.name === 'werewolf') {
        werewolfRoles.push({ id, ...role });
      }
      if (role.name === 'mason') {
        masonRoles.push({ id, ...role });
      }
      if (role.name === 'villager') {
        villagerRoles.push({ id, ...role });
      }

      roles.push({ id, ...role });
    }

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

    this.setState({
      roles,
      duplicateRoles: {
        werewolf: werewolfRoles,
        mason: masonRoles,
        villager: villagerRoles
      },
    });
  };

  activateRole = (roleID) => {
    //These are the roles selected to play
    const gameRoles = this.room.state.roles;

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
    // this.room.state.roles.onChange = (role, roleID) => {
    //   console.debug(`${role} is now ${roleID}`);
    //   console.debug(`${roleID}.active is now ${role.active}`);
    // };
  };

  render() {
    const { roles, duplicateRoles } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.getStartedText}>
              Select which roles you wish to include:
            </Text>
            {roles.map(role => {
              if (Object.keys(duplicateRoles).includes(role.name)) {
                if (role.id.endsWith('0')) {
                  return <RoleGroup key={role.name} roles={duplicateRoles[role.name]}
                                    onActivateRole={this.activateRole}/>
                }
              } else {
                return <RoleButton key={role.id} role={role} onActivateRole={this.activateRole}/>
              }
            })}
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
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
