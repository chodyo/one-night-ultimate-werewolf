import * as React from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, Animated } from 'react-native'; //Step 1
import { NightTheme } from "../constants/Colors";

export default class RolePanel extends React.Component {
    constructor(props) {
        super(props);
        this.icons = {     //Step 2
            'up': '<',
            'down': '>'
        };

        this.state = {       //Step 3
            title: props.title,
            expanded: true,
            animation: new Animated.Value()
        };
    }

    toggle() {
        //Step 1
        let initialValue = this.state.expanded ? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
            finalValue = this.state.expanded ? this.state.minHeight : this.state.maxHeight + this.state.minHeight;

        this.setState({
            expanded: !this.state.expanded  //Step 2
        });

        this.state.animation.setValue(initialValue);  //Step 3
        Animated.spring(     //Step 4
            this.state.animation,
            {
                toValue: finalValue
            }
        ).start();  //Step 5
    }
    _setMaxHeight(event) {
        this.setState({
            maxHeight: event.nativeEvent.layout.height
        });
    }

    _setMinHeight(event) {
        this.setState({
            minHeight: event.nativeEvent.layout.height
        });
    }

    render() {
        let icon = this.icons['down'];

        if (this.state.expanded) {
            icon = this.icons['up'];   //Step 4
        }

        //Step 5
        return (
            <Animated.View
                style={[styles.container, { height: this.state.animation }]}>
                <View style={styles.container} >
                    <View style={styles.titleContainer} onLayout={this._setMinHeight.bind(this)}>
                        <Text style={styles.title}>{this.state.title} description</Text>
                        <TouchableHighlight
                            style={styles.button}
                            onPress={this.toggle.bind(this)}
                            underlayColor="#f1f1f1">
                            <Image style={styles.buttonImage} source={icon}></Image>
                        </TouchableHighlight>
                    </View>

                    <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
                        {this.props.children}
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: NightTheme.darkBlue,
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row'
    },
    title: {
        flex: 1,
        fontSize: 20,
        padding: 10,
        color: NightTheme.activeText,
        fontWeight: 'bold'
    },
    button: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: NightTheme.buttonSelectedBorder,
    },
    buttonImage: {
        width: 30,
        height: 25
    },
    body: {
        padding: 10,
        paddingTop: 0
    }
});