import React from 'react';
import PlayerSelectionAction from "./PlayerSelectionAction";
import CenterCards from "./CenterCards";

const SelectionAction = ({ players, maxPlayers, selectedPlayers, cards, maxCards, selectedCards, onSelection }) => {
  return (
    <>
      {maxPlayers > 0 && (
        <PlayerSelectionAction players={players} selected={selectedPlayers} onSelection={onSelection} />
      )}
      {maxCards > 0 && (
        <CenterCards cards={cards} selected={selectedCards} onSelection={onSelection} />
      )}
    </>
  );
};

export default SelectionAction;
