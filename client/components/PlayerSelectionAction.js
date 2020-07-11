import * as React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NightTheme } from "../constants/Colors";

const PlayerSelectionAction = ({ players, onSelection, selected }) => (
  <>
    {players.map(player => (
      <TouchableOpacity
        key={player.id}
        style={selected.includes(player.id) ? styles.selectedButtonStyle : styles.unSelectedButton}
        onPress={() => onSelection(player.id, true)}
      >
        <Text style={styles.getStartedText}> {player.name.length === 0 ? player.id :player.name}</Text>
      </TouchableOpacity>
    ))}
  </>
);

PlayerSelectionAction.propTypes = {
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelection: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const styles = StyleSheet.create({
  getStartedText: {
    fontSize: 15,
    color: NightTheme.buttonText,
    justifyContent: 'center',
    borderRadius: '10px',
    alignItems: 'center',
    textAlign: 'center',
  },
  selectedButtonStyle: {
    backgroundColor: NightTheme.buttonSelected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '10px',
    borderColor: NightTheme.buttonSelectedBorder,
    alignItems: 'center',
  },
  unSelectedButton: {
    backgroundColor: NightTheme.buttonUnselected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonUnselected,
    borderRadius: '10px',
    alignItems: 'center',
  },
  optionText: {
    color: NightTheme.buttonText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
});

export default PlayerSelectionAction;
