import * as React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NightTheme } from "../constants/Colors";

const PlayerSelectionAction = ({ players, onSelection, selected }) => (
  <View>
    {players.map(player => (
      <TouchableOpacity
        key={player.id}
        style={selected.includes(player.id) ? styles.selectedButtonStyle : styles.unSelectedButton}
        onPress={() => onSelection(player.id, true)}
      >
        <Text style={styles.getStartedText}> PLAYER: {player.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

PlayerSelectionAction.propTypes = {
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelection: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const styles = StyleSheet.create({
  selectedButtonStyle: {
    backgroundColor: NightTheme.buttonSelected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonSelectedBorder,
    alignItems: 'center',
  },
  unSelectedButton: {
    backgroundColor: NightTheme.buttonBackground,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonBackground,
    alignItems: 'center',
  },
  optionText: {
    color: NightTheme.activeText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
});

export default PlayerSelectionAction;
