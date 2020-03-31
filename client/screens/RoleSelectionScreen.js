import React from 'react';
import PropTypes from 'prop-types'
import { Button, Image, Platform, StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { roleDefinitions } from "../constants/RoleDefinitions";
import OptionButton from '../components/OptionButton';


class RoleSelectionScreen extends React.Component {
  static propTypes = {
    //    room: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      roleDefinitions: null,
      activeRoles: [],
    };
  }

  async componentDidMount() {
    await this.loadRoles();
  }

  async loadRoles() {

    this.setState({ roleDefinitions: roleDefinitions });
  }

  activateRole = (roletoggle) => {
    //These are the roles selected to play
    const { activeRoles } = this.state;
    //Check whether the clicked role has already been selected (or exists in active roles)
    const roleExists = activeRoles.includes(roletoggle);
    //New list of roles which checks whether to add or remove the role to Active Roles selected to play
    let newRoles = roleExists ? activeRoles.filter(role => roletoggle !== role) : activeRoles.concat(roletoggle);
    //Updates Active Roles to the expected roles to include
    this.setState({ activeRoles: newRoles });
  };

  render() {
    const { activeRoles } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.button}>
            <Text style={styles.getStartedText}>
              Select which roles you wish to include:
            </Text>
            {Object.entries(roleDefinitions).map(([role, definition]) => (
              <TouchableOpacity style={activeRoles.includes(role) ? styles.selectedButtonStyle : styles.button}>
                <OptionButton
                  icon={definition.imageToken}
                  label={role}
                  onPress={() => { this.activateRole(role); console.log(activeRoles); console.log(role) }}
                // onPress={() => WebBrowser.openBrowserAsync('https://docs.expo.io')}
                />
              </TouchableOpacity>
            ))}

          </View>
        </ScrollView>
        <Button style={styles.unSelectedButton} onPress={() => this.activateRole(null)} title="Start Game" />
      </View>
    );
  }
}

export default RoleSelectionScreen;

RoleSelectionScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.werewolfBlue,
  },
  contentContainer: {
    alignItems: 'center',
    flex: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 30,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 30,
    color: Colors.activeText,
    // lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  selectedButtonStyle: {
    textAlign: 'center',
    backgroundColor: '#939FA0',
    paddingHorizontal: 5,
    paddingVertical: 5,
    // borderWidth: StyleSheet.hairlineWidth,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.buttonSelectedBorder,
    color: Colors.inactiveText,
  },
  unSelectedButton: {
    textAlign: 'center',
    backgroundColor: Colors.buttonBackground,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.borderWidth,
    color: Colors.activeText,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
