import * as React from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, Animated } from 'react-native'; //Step 1
import IconButton from '@material-ui/core/IconButton'
import ArrowUpwardIcon from '@material-ui/icons/KeyboardArrowUp'
import ArrowDownwardIcon from '@material-ui/icons/KeyboardArrowDown'
import { NightTheme } from "../constants/Colors";

export default class RolePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: props.title,
            expanded: true,
            animation: new Animated.Value()
        };
    }

    toggle() {
        let initialValue = this.state.expanded ? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
            finalValue = this.state.expanded ? this.state.minHeight : this.state.maxHeight + this.state.minHeight;

        this.setState({
            expanded: !this.state.expanded
        });

        this.state.animation.setValue(initialValue);
        Animated.spring(
            this.state.animation,
            {
                toValue: finalValue
            }
        ).start();
    }
    setMaxHeight(event) {
        this.setState({
            maxHeight: event.nativeEvent.layout.height
        });
    }

    setMinHeight(event) {
        this.setState({
            minHeight: event.nativeEvent.layout.height
        });
    }

    render() {
        let icon = <ArrowDownwardIcon />;

        if (this.state.expanded) {
            icon = <ArrowUpwardIcon />
        }

        //Step 5
        return (
            <Animated.View
                style={[styles.container, { height: this.state.animation }]}>
                <View style={styles.container} >
                    <View style={styles.titleContainer} onLayout={this.setMinHeight.bind(this)}>
                        <Text style={styles.title}>{this.state.title} description</Text>
                        <IconButton
                            key="expand"
                            aria-label="expand"
                            color="inherit"
                            className={styles.expand}
                            onClick={this.toggle.bind(this)}
                        >
                            {icon}
                        </IconButton>
                    </View>

                    <View style={styles.body} onLayout={this.setMaxHeight.bind(this)}>
                        {this.props.children}
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    expand: {
        padding: 0.5,
    },
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