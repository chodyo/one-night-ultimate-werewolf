import * as React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import { NightTheme } from "../constants/Colors";

export default class NightScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rolePrompt: '',
      roleDescription: '',
    };
  }

  componentDidMount() {
    const { role } = this.props;

    try {
      const roles = require('../../static/assets/onenight.json');
      const { prompt, description } = roles[role.name];
      this.setState({ rolePrompt: prompt, roleDescription: description });
    } catch (e) {
      console.error('Fucked in the night by:', e);
    }
  }

  emphasizeText = (text) => <Text style={styles.emphasis}>{text}</Text>;

  render() {
    const { player, role, markAsReady } = this.props;
    const { rolePrompt, roleDescription } = this.state;

    return (
      <View style={styles.container}>
        <Button style={styles.unSelectedButton} onPress={() => markAsReady()} title="Ready" />
        <Text style={styles.getStartedText}>
          {player.name}, your role is the {this.emphasizeText(role.name)}, which is on the {this.emphasizeText(role.team)} team.
        </Text>
        <Text style={styles.getStartedText}>
          {roleDescription}
        </Text>
        <Text style={styles.getStartedText}>
          Please: {rolePrompt}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: NightTheme.darkBlue,
  },
  getStartedText: {
    fontSize: 30,
    color: NightTheme.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
  emphasis: {
    fontSize: 32,
    color: NightTheme.inputText,
  },
});
