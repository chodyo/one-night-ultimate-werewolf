import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Client } from 'colyseus.js';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import RulesScreen from "../screens/RulesScreen";
import RoleSelectionScreen from "../screens/RoleSelectionScreen";

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });
  const [room, setRoom] = React.useState();

  React.useEffect(() => {
    async function loadRoom() {
      try {
        setRoom(await new Client('ws://localhost:2567').joinOrCreate('my_room'));
      } catch (e) {
        console.error('Fucked in BottomTabNavigator by:', e);
      }
    }

    loadRoom();
  }, []);

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Home"
        component={() => <HomeScreen room={room} />}
        options={{
          title: 'Join Room',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-code-working" />,
        }}
      />
      <BottomTab.Screen
        name="Roles"
        component={() => <RoleSelectionScreen room={room} />}
        options={{
          title: 'Roles',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-settings" />,
        }}
      />
      <BottomTab.Screen
        name="Rules"
        component={RulesScreen}
        options={{
          title: 'Rules',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-book" />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Home':
      return 'One Night Ultimate Werewolf';
    case 'Roles':
      return 'Roles to Play';
    case 'Rules':
      return 'Rules of the Game';
  }
}
