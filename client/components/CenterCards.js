import React from 'react';
import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {NightTheme} from "../constants/Colors";

const CenterCards = ({ centerRoles }) => (
  <>
    {centerRoles.map(centerRole => (
      <TouchableOpacity key={centerRole.label}>
        <Text style={{color: NightTheme.activeText}}>{centerRole.label} {centerRole.name}</Text>
      </TouchableOpacity>
    ))}
  </>
);

export default CenterCards;
