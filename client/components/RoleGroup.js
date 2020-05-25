import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import RoleButton from './RoleButton';

const RoleGroup = ({ roles, onActivateRole }) => (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    {roles.map(role => <RoleButton key={role.roleID} role={role} onActivateRole={onActivateRole} />)}
  </View>
);

RoleButton.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.object),
  onActivateRole: PropTypes.func.isRequired,
};

export default RoleGroup;



