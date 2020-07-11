import React from 'react';
import { Text } from 'react-native';
import PlayerSelectionAction from "./PlayerSelectionAction";
import CenterCards from "./CenterCards";
import { Styles } from "../constants/Themes";
import { TouchableOpacity } from 'react-native-gesture-handler';

const SelectionAction = ({ actionRequired, selectNone, players, maxPlayers, selectedPlayers, cards, maxCards, selectedCards, onSelection }) => {

  //Optional players Explicit Don't troublemake, divine, rob, etc.
  return (
    <>
      {!actionRequired && (maxPlayers > 0 || maxCards > 0) &&
        <TouchableOpacity
          key='SelectNone'
          style={selectedPlayers.length === 0 && selectedCards.length === 0 ? Styles.selectedButtonStyle : Styles.unSelectedButton}
          onPress={selectNone}
        >
          <Text style={Styles.getStartedText}> Don't do anything</Text>
        </TouchableOpacity>}
      {maxPlayers > 0 && (
        <PlayerSelectionAction
          players={players}
          selected={selectedPlayers}
          onSelection={onSelection}
        />
      )}
      {maxCards > 0 && (
        <CenterCards cards={cards} selected={selectedCards} onSelection={onSelection} />
      )}
    </>
  );
};

export default SelectionAction;
