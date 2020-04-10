import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NightTheme } from '../constants/Colors';
import RoleButton from "../components/RoleButton";
import RoleGroup from "../components/RoleGroup";

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
    console.debug('Loading RoleSelectionScreen');
    await this.start();
  }

  // LIFECYCLE
  start = async () => {
    const { room } = this.props;
    try {
      room.onStateChange(() => this.loadRoles());
    } catch (error) {
      console.error("Fucked by ", error);
    }
  };

  loadRoles = async () => {
    const { roles: gameRoles } = this.props.room.state;

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
    const { room } = this.props;
    const { roles: gameRoles } = room.state;

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
    room.send(request);
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
    backgroundColor: NightTheme.darkBlue,
  },
  contentContainer: {
    alignItems: 'center',
    flex: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 30,
  },
  getStartedText: {
    fontSize: 30,
    color: NightTheme.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
});
