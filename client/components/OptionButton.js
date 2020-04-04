import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton, } from 'react-native-gesture-handler';
import Colors from "../constants/Colors";

import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import icoMoonConfig from '../assets/fonts/selection.json';

const expoAssetId = require("../assets/fonts/Werewolf.ttf");
const MoonIcon = createIconSetFromIcoMoon(icoMoonConfig, 'werewolf', expoAssetId);

export default function OptionButton({ icon, label, onPress, isLastOption }) {
    return (
        <RectButton style={[styles.option, isLastOption && styles.lastOption]} onPress={onPress}>
            <View style={{ flexDirection: 'row' }}>
                <View style={styles.optionIconContainer}>
                    <MoonIcon name={icon} size={22} color={Colors.activeText} />
                </View>
                <View style={styles.optionIconContainer}>
                    <Text style={styles.optionText}>{label}</Text>
                </View>
            </View>
        </RectButton>
    );
}

const styles = StyleSheet.create({
    optionIconContainer: {
        marginRight: 12,
    },
    option: {
        backgroundColor: Colors.buttonSelectedBorder,
        size: 15,
        color: Colors.activeText,
    },
    lastOption: {
        size: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    optionText: {
        color: Colors.activeText,
        fontSize: 15,
        alignSelf: 'flex-start',
        marginTop: 1,
    },
});