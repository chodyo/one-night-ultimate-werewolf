import * as React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { NightTheme } from "../constants/Colors";

const PlayerSelectionAction = ({ players }) => {
    return (
        <View>
            {players.map(player => (
                < TouchableOpacity key={player.id} style={styles.unSelectedButton}>
                    <RectButton style={styles.alignmentStyle} onPress={() => console.debug(`You Selected ${player.name}`)}>
                        <Text style={styles.getStartedText}> PLAYER: {player.name}</Text>
                    </RectButton>
                </TouchableOpacity>
            ))}
        </View >
    );
};

PlayerSelectionAction.propTypes = {
    players: PropTypes.arrayOf(PropTypes.object)
};

const styles = StyleSheet.create({
    selectedButtonStyle: {
        backgroundColor: NightTheme.buttonSelected,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: NightTheme.buttonSelectedBorder,
    },
    unSelectedButton: {
        backgroundColor: NightTheme.buttonUnselected,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: NightTheme.buttonUnselected,
    },
    alignmentStyle: {
        alignItems: 'center',
    },
    optionText: {
        color: NightTheme.activeText,
        fontSize: 15,
        paddingHorizontal: 5,
        marginBottom: 5,
        // alignSelf: 'flex-start',
        // marginTop: 1,
    },
});

export default PlayerSelectionAction;