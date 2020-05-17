import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NightTheme } from "../constants/Colors";

const CenterCards = ({ centerRoles, onSelection, selected }) => (
  <View style={styles.container}>
    {centerRoles.map(centerRole => (
      <TouchableOpacity
        key={centerRole.label}
        style={selected.includes(centerRole.label) ? styles.cardSelected : styles.card}
        onPress={() => onSelection(centerRole.label, false)}
      >
        <Text style={styles.optionText}>{centerRole.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

CenterCards.propTypes = {
  centerRoles: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelection: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: '1rem',
  },
  card: {
    backgroundColor: NightTheme.buttonUnselected,
    borderColor: NightTheme.buttonUnselected,
    justifyContent: 'center',
    margin: '2rem',
    width: '25vw',
    height: '70vh',
    borderRadius: '10px',
    alignItems: 'center',
  },
  cardSelected: {
    backgroundColor: NightTheme.buttonSelected,
    borderColor: NightTheme.buttonSelectedBorder,
    justifyContent: 'center',
    margin: '2rem',
    width: '25vw',
    height: '70vh',
    borderRadius: '10px',
    alignItems: 'center',
  },
  optionText: {
    color: NightTheme.activeText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
});

export default CenterCards;