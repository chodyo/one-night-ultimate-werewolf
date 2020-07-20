import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';
import { Styles } from "../constants/Themes";

class CountDownTimer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: null
        };

        this.timeIntervalRef = null;
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

    render() {
        const { firstText, secondText } = this.props;
        const { time } = this.state;

        let message = 'Time is up!';
        if (time >= 0) {
            message = `${firstText} ${time} ${secondText}`;
        }

        return <Text style={Styles.getStartedText}>{message}</Text>;
    }
}

CountDownTimer.propTypes = {
    firstText: PropTypes.string,
    secondText: PropTypes.string,
    time: PropTypes.number,
};

CountDownTimer.defaultProps = {
    firstText: '',
    secondText: '',
    time: 3
};

export default CountDownTimer;
