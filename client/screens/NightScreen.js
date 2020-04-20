import * as React from 'react';
import {Text, View} from 'react-native';
import {NightTheme} from "../constants/Colors";

export default class NightScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerName: null,
    };
  }

  render() {
    const { player, role } = this.props;

    return (
      <View>
        <Text style={{ color: NightTheme.activeText }}>
          {player.name}, your role is {role.name}. You're on the {role.team} team.
        </Text>
      </View>
    );
  }
}
