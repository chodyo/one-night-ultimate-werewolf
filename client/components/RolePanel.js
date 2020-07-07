import * as React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native'; //Step 1
import IconButton from '@material-ui/core/IconButton'
import ArrowUpwardIcon from '@material-ui/icons/KeyboardArrowUp'
import ArrowDownwardIcon from '@material-ui/icons/KeyboardArrowDown'
import { NightTheme } from "../constants/Colors";

export default class RolePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: props.title,
            expanded: false,
            animation: new Animated.Value()
        };
    }

    toggle() {
        const { expanded, animation, maxHeight, minHeight } = this.state;
        let initialValue = expanded ? minHeight : maxHeight + minHeight,
            finalValue = expanded ? maxHeight + minHeight : minHeight;

        this.setState({
            expanded: !expanded
        });

        animation.setValue(initialValue);
        Animated.spring(
            animation,
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
        const { title, expanded, animation } = this.state;

        let icon = expanded ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />;

        //Step 5
        return (
            <Animated.View
                style={[styles.container, { height: animation }]}>
                <View style={styles.container} >
                    <View style={styles.titleContainer} onLayout={this.setMinHeight.bind(this)}>
                        <Text style={styles.title}>{title} description</Text>
                        <IconButton
                            key="expand"
                            aria-label="expand"
                            color="primary"
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
