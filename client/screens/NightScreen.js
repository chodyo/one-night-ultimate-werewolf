import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NightTheme } from "../constants/Colors";

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
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.getStartedText}>
          {player.name}, your role is {role.name}.
          You're on the {role.team} team.
          Please: {role.prompt}
          {role.description}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NightTheme.darkBlue,
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
  getStartedText: {
    fontSize: 30,
    color: NightTheme.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
  getStartedInputsBox: {
    fontSize: 24,
    color: NightTheme.inputText,
    // lineHeight: 24,
    textAlign: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  getStartedInputsText: {
    fontSize: 24,
    color: NightTheme.inputText,
    // lineHeight: 24,
    textAlign: 'center',
  },
});
