import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NightTheme } from '../constants/Colors';
import RoleButton from "./RoleButton";
import RoleGroup from "./RoleGroup";
import { sortRolesByWakeOrder } from "../assets/GameUtil";

export default class RoleSelection extends React.Component {
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
      wakingRoles: [],
      nooners: [],
    };
  }

  async componentDidMount() {
    console.debug('Loading RoleSelection');
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
    let wakingRoles = [];
    let villagerRoles = [];
    let nooners = [];
    for (let id in gameRoles) {
      let role = gameRoles[id];

      switch (role.name) {
        case 'werewolf':
          werewolfRoles.push(role);
          break;
        case 'mason':
          masonRoles.push(role);
          break;
        case 'seer':
        case 'robber':
        case 'troublemaker':
        case 'drunk':
          wakingRoles.push(role);
          break;
        case 'insomniac':
        case 'hunter':
        case 'tanner':
          nooners.push(role);
          break;
        case 'villager':
          villagerRoles.push(role);
          break;
      }

      roles.push(role);
    }

    this.setState({
      roles: sortRolesByWakeOrder(roles),
      duplicateRoles: {
        werewolf: werewolfRoles,
        mason: masonRoles,
        villager: villagerRoles
      },
      wakingRoles: sortRolesByWakeOrder(wakingRoles),
      nooners
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
    const { roles, duplicateRoles, wakingRoles, nooners } = this.state;

    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.getStartedText}>
          Select which roles you wish to include:
        </Text>
        {roles.map(role => {
          if (Object.keys(duplicateRoles).includes(role.name)) {
            if (role.roleID.endsWith('0')) {
              return <RoleGroup key={role.name} roles={duplicateRoles[role.name]}
                onActivateRole={this.activateRole} />
            }
          } else {
            if ('doppelganger' === role.name || 'minion' === role.name) {
              return <RoleButton key={role.roleID} role={role} onActivateRole={this.activateRole} />
            } else if ('seer' === role.name) {
              return <RoleGroup key="wakingRoles" roles={wakingRoles} onActivateRole={this.activateRole} />
            } else if ('insomniac' === role.name) {
              return <RoleGroup key="nooners" roles={nooners} onActivateRole={this.activateRole} />
            }
          }
        })}
      </View>
    );
  }
}

RoleSelection.navigationOptions = {
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
