import * as React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PlayerSelectionAction = ({ players, onSelection, selected, styles }) => (
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

export default PlayerSelectionAction;
