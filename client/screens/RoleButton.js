import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';

import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import icoMoonConfig from '../assets/fonts/selection.json';

const expoAssetId = require('../assets/fonts/Werewolf.ttf');
const MoonIcon = createIconSetFromIcoMoon(icoMoonConfig, 'werewolf', expoAssetId);

const RoleButton = ({ role, onActivateRole }) => {
  const roleName = role.name[0].toUpperCase() + role.name.slice(1);
  const roleIcon = role.name + '-token';

  return (
    <TouchableOpacity style={role.active ? styles.selectedButtonStyle : styles.unSelectedButton}>
      <RectButton style={styles.alignmentStyle} onPress={() => onActivateRole(role.id)}>
        <MoonIcon name={roleIcon} size={45} color={Colors.activeText} />
        <Text style={styles.optionText}>{roleName}</Text>
      </RectButton>
    </TouchableOpacity>
  );
};

RoleButton.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    team: PropTypes.string.isRequired,
    wakeOrder: PropTypes.number.isRequired,
  }).isRequired,
  onActivateRole: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  selectedButtonStyle: {
    backgroundColor: '#939FA0',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.buttonSelectedBorder,
  },
  unSelectedButton: {
    backgroundColor: Colors.buttonBackground,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.buttonBackground,
  },
  alignmentStyle: {
    backgroundColor: Colors.buttonSelectedBorder,
    alignItems: 'center',
    verticalAlign: 'middle',
  },
  optionText: {
    color: Colors.activeText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
    // alignSelf: 'flex-start',
    // marginTop: 1,
  },
});

export default RoleButton;
