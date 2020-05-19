import * as React from 'react';
import NavigationTestUtils from 'react-navigation/NavigationTestUtils';
import renderer from 'react-test-renderer';

import AppExample from '../AppExample';

jest.mock('expo', () => ({
  AppLoading: 'AppLoading',
}));

jest.mock('../navigation/AppNavigator', () => 'AppNavigator');

describe('AppExample', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    NavigationTestUtils.resetInternalState();
  });

  it(`renders the loading screen`, () => {
    const tree = renderer.create(<AppExample />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it(`renders the root without loading screen`, () => {
    const tree = renderer.create(<AppExample skipLoadingScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
