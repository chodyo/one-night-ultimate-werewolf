import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NightTheme } from '../constants/Colors';
import RoleButton from "./RoleButton";
import RoleGroup from "./RoleGroup";

export default class RoleSelection extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    const { roles } = this.props;

    let werewolfRoles = [];
    let masonRoles = [];
    let wakingRoles = [];
    let villagerRoles = [];
    let nooners = [];
    roles.map(role => {
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
    });

    this.state = {
      duplicateRoles: {
        werewolf: werewolfRoles,
        mason: masonRoles,
        villager: villagerRoles,
      },
      wakingRoles,
      nooners
    };
  }

  render() {
    const { roles, onRoleChoice } = this.props;
    const { duplicateRoles, wakingRoles, nooners } = this.state;

    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.getStartedText}>
          Select which roles you wish to include:
        </Text>
        {roles.map(role => {
          if (Object.keys(duplicateRoles).includes(role.name)) {
            if (role.roleID.endsWith('0')) {
              return <RoleGroup key={role.name} roles={duplicateRoles[role.name]}
                onActivateRole={onRoleChoice} />
            }
          } else {
            if ('doppelganger' === role.name || 'minion' === role.name) {
              return <RoleButton key={role.roleID} role={role} onActivateRole={onRoleChoice} />
            } else if ('seer' === role.name) {
              return <RoleGroup key="wakingRoles" roles={wakingRoles} onActivateRole={onRoleChoice} />
            } else if ('insomniac' === role.name) {
              return <RoleGroup key="nooners" roles={nooners} onActivateRole={onRoleChoice} />
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
