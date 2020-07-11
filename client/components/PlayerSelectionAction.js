import * as React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Styles } from "../constants/Themes";

const PlayerSelectionAction = ({ players, onSelection, selected }) => (
  <>
    {players.map(player => (
      <TouchableOpacity
        key={player.id}
        style={selected.includes(player.id) ? Styles.selectedButtonStyle : Styles.unSelectedButton}
        onPress={() => onSelection(player.id, true)}
      >
        <Text style={Styles.getStartedText}> {player.name.length === 0 ? player.id :player.name}</Text>
      </TouchableOpacity>
    ))}
  </>
);

PlayerSelectionAction.propTypes = {
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelection: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PlayerSelectionAction;
