import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { NightTheme } from "../constants/Colors";
import iffun from '@bit/rivigo.ui.utils.iffun';

/**
 * @render react
 * @name CountDownTimer
 * @description Sample CountDownTimer Component.
 * @example
 * <CountDownTimer
 * firstText='You have '
 * secondText=' seconds to vote'
 * time = {60} />
 */

class CountDownTimer extends Component {
    constructor() {
        super();
        this.state = {
            time: null
        };

        this.timeIntervalRef = null;
    }

    render() {
        const { firstText, secondText } = this.props;
        const { time } = this.state;

        return (
            <View style={styles.getStartedText}>
                {iffun(
                    time >= 0,
                    () => {
                        return (
                            <span>
                                {firstText}
                                {time}
                                {secondText}
                            </span>
                        );
                    },
                    () => iffun(this.props.timeIsOver !== undefined, () => this.props.timeIsOver(), null)
                )}
            </View>
        );
    }

    componentDidMount() {
        this.setState(
            {
                time: this.props.time
            },
            () => {
                this.timeIntervalRef = setInterval(() => {
                    if (this.state.time === 0) {
                        clearInterval(this.timeIntervalRef);
                        this.setState({
                            time: this.state.time - 1
                        });
                    } else {
                        this.setState({
                            time: this.state.time - 1
                        });
                    }
                }, 1000);
            }
        );
    }
}

CountDownTimer.propTypes = {
    firstText: PropTypes.string,
    secondText: PropTypes.string,
    time: PropTypes.number,
    timeIsOver: PropTypes.func
};

CountDownTimer.defaultProps = {
    firstText: '',
    secondText: '',
    time: 3
};

export default CountDownTimer;

const styles = StyleSheet.create({
    getStartedText: {
        fontSize: 30,
        color: NightTheme.activeText,
        alignItems: 'center',
    },
});