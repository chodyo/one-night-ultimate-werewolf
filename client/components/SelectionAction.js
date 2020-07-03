import React from 'react';
import PlayerSelectionAction from "./PlayerSelectionAction";
import CenterCards from "./CenterCards";

export const SelectionAction = ({ players, maxPlayers, selectedPlayers, cards, maxCards, selectedCards, makeSelection }) => {
  return (
    <>
      {maxPlayers > 0 && (
        <PlayerSelectionAction players={players} selected={selectedPlayers} onSelection={this.makeSelection} />
      )}
      {maxCards > 0 && (
        <CenterCards centerRoles={cards} selected={selectedCards} onSelection={this.makeSelection} />
      )}
    </>
  );
};
