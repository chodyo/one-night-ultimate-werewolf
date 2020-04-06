import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';

import Colors, {NightTheme} from '../constants/Colors';

export default function TabBarIcon(props) {
  return (
    <Ionicons
      style={{ backgroundColor: NightTheme.darkBlue }}
      name={props.name}
      size={30}
      style={{ marginBottom: -3 }}
      color={props.focused ? NightTheme.activeText : NightTheme.inactiveText}
    />
  );
}
