import React from 'react';
import { StyleSheet, Text } from 'react-native';
import PlayerSelectionAction from "./PlayerSelectionAction";
import CenterCards from "./CenterCards";
import { NightTheme } from "../constants/Colors";
import { TouchableOpacity } from 'react-native-gesture-handler';

const SelectionAction = ({ actionRequired, selectNone, players, maxPlayers, selectedPlayers, cards, maxCards, selectedCards, onSelection }) => {
  
  //Optional players Explicit Don't troublemake, divine, rob, etc.
  return (
    <>
      {!actionRequired && (maxPlayers > 0 || maxCards > 0) &&
        <TouchableOpacity
          key='SelectNone'
          style={selectedPlayers.length === 0 && selectedCards.length === 0 ? styles.selectedButtonStyle : styles.unSelectedButton}
          onPress={selectNone}
      >
        <Text style={styles.getStartedText}> Don't do anything</Text>
        </TouchableOpacity>}
      {maxPlayers > 0 && (
        <PlayerSelectionAction
          styles={styles}
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

export default SelectionAction;
