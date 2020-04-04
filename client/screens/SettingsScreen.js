import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Font from 'expo-font';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import Colors from "../constants/Colors";
import OptionButton from '../components/OptionButton';

import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import icoMoonConfig from '../assets/fonts/selection.json';

const expoAssetId = require("../assets/fonts/Werewolf.ttf");
const MoonIcon = createIconSetFromIcoMoon(icoMoonConfig, 'werewolf', expoAssetId);

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* <View>
        <MoonIcon name="werewolf-token" size={80} color="#bf1313" />
      </View> */}
      <OptionButton
        icon="werewolf-token"
        label="Werewolf"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />
      <OptionButton
        icon="doppelganger-token"
        label="Doppelganger"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />
      <OptionButton
        icon="drunk-token"
        label="Drunk"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />
      <OptionButton
        icon="hunter-token"
        label="Hunter"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />
      <OptionButton
        icon="mason-token"
        label="Werewolf"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />
      <OptionButton
        icon="robber-token"
        label="Robber"
        onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
      />

      <OptionButton
        icon="villager-token"
        label="Villager"
        onPress={() => WebBrowser.openBrowserAsync('https://reactnavigation.org')}
      />

      <OptionButton
        icon="seer-token"
        label="Seer"
        onPress={() => WebBrowser.openBrowserAsync('https://forums.expo.io')}
        isLastOption
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.werewolfBlue,
  },
  contentContainer: {
    paddingTop: 15,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: '#ededed',
  },
  lastOption: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 15,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
});
