import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RectButton, TouchableOpacity} from 'react-native-gesture-handler';
import {NightTheme} from "../constants/Colors";

const CenterCards = ({ centerRoles, selectCard }) => (
  <View style={styles.container}>
    {centerRoles.map(centerRole => (
      <TouchableOpacity key={centerRole.label} style={styles.card}>
        <RectButton style={{ alignItems: 'center' }} onPress={() => selectCard(centerRole.name)}>
          <Text style={styles.optionText}>{centerRole.label}</Text>
        </RectButton>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: '1rem',
  },
  card: {
    backgroundColor: NightTheme.buttonUnselected,
    // paddingHorizontal: 5,
    // paddingVertical: 5,
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonUnselected,
    justifyContent: 'center',
    margin: '2rem',
    width: '25vw',
    height: '70vh',
    borderRadius: '10px'
  },
  optionText: {
    color: NightTheme.activeText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
});

export default CenterCards;
