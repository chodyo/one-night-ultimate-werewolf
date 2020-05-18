import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NightTheme } from '../constants/Colors';
import RoleButton from "../components/RoleButton";
import RoleGroup from "../components/RoleGroup";

export default class RoleSelectionScreen extends React.Component {
  static propTypes = {};

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
    // let wakingRoles = [];
    let villagerRoles = [];
    for (let id in gameRoles) {
      let role = gameRoles[id];

      if (role.name === 'werewolf') {
        werewolfRoles.push({ id, ...role });
      }
      if (role.name === 'mason') {
        masonRoles.push({ id, ...role });
      }
      // if (role.name === 'seer' || role.name === 'robber' || role.name === 'troublemaker' || role.name === 'drunk') {
      //   wakingRoles.push({ id, ...role });
      // }
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
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.getStartedText}>
          Select which roles you wish to include:
        </Text>
        {roles.map(role => {
          if (Object.keys(duplicateRoles).includes(role.name)) {
            if (role.id.endsWith('0')) {
              return <RoleGroup key={role.name} roles={duplicateRoles[role.name]}
                onActivateRole={this.activateRole} />
            }
          } else {
            return <RoleButton key={role.id} role={role} onActivateRole={this.activateRole} />
          }
        })}
      </View>
    );
  }
}

RoleSelectionScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  getStartedText: {
    fontSize: 30,
    color: NightTheme.buttonText,
    // lineHeight: 24,
    textAlign: 'center',
  },
});
