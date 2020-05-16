import * as React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';
import { NightTheme } from "../constants/Colors";
import { Room } from 'colyseus.js';

export default class PlayerSelectionAction extends React.Component {
    static propTypes = { players: PropTypes.arrayOf(PropTypes.object) };
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    sendPlayerSelectionAction = () => {
        for (let player in players) {
            if (player.role === 'doppelganger') {
                //display all playernames in room to pick from
                //Send server which player was picked
                //display new doppelganger role

                //IF the new role anf of <Seer, Robber, Troublemaker, Drunk>
                //The action of those doppelganged is immediately performed

            }
            if (player.role === 'seer') {
                //display option to pick from player or look at 2 in the center
                //display players to pick from 
                //Send server which player was picked
                //display player role
                //display center cards in the center for picking 2 to look at
                //Send Server which center cards were looked at
                //Display selected cards
            }
            if (player.role === 'robber') {
                //display option to rob or not
                //display players to pick from
                //Send server which player was picked
                //display picked player's role
            }
            if (player.role === 'troublemaker') {
                //display option to troublemake or not
                //display players to pick from (select 2)
                //Send server which players were picked
                //nothing else, maybe display confirmation that player_x & player_y were switched

            }
        }
    }

    render() {
        const { players } = this.props;

        return (
            <View>
                {players.map(player => (
                    < TouchableOpacity key={player.id} style={styles.unSelectedButton}>
                        <RectButton style={styles.alignmentStyle} onPress={
                            () => {
                                console.debug(`You Selected ${player.name}`);
                                sendPlayerSelectionAction();
                            }
                        }>
                            <Text style={styles.getStartedText}> PLAYER: {player.name}</Text>
                        </RectButton>
                    </TouchableOpacity>
                ))}
            </View >
        );
    }
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
        backgroundColor: NightTheme.buttonBackground,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: NightTheme.buttonBackground,
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
