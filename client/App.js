import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Once your custom font has been loaded...
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import icoMoonConfig from './config.json';
const glyphMap = { 'icon-name': 1234, test: '∆' };
const expoAssetId = require("./assets/fonts/Werewolf.ttf");
const MoonIcon = createIconSetFromIcoMoon(glyphMap, 'werewolf', expoAssetId);

const glyphMap = { 'icon-name': 1234, test: '∆' };
const expoAssetId = require("./assets/fonts/werewolf.ttf");
const CustomIcon = createIconSet(glyphMap, 'FontName', expoAssetId);

export default class CustomIconExample extends React.Component {
  render() {
    return (
      <CustomIcon name="icon-name" size={32} color="red" />
    );
  }
}

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import Colors from "./constants/Colors";

const Stack = createStackNavigator();

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          ...MoonIcon.font,
          'werewolf': require('./assets/fonts/Werewolf.ttf'),

        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
          <Stack.Navigator>
            <Stack.Screen name="Root" component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.werewolfBlue,
  },
});
