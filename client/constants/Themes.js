import { StyleSheet } from "react-native";
import { NightTheme } from "./Colors";

export const Styles = StyleSheet.create({
  getStartedText: {
    fontSize: 15,
    color: NightTheme.buttonText,
    justifyContent: 'center',
    borderRadius: '10px',
    alignItems: 'center',
    textAlign: 'center',
  },
  selectedButtonStyle: {
    backgroundColor: NightTheme.buttonSelected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '10px',
    borderColor: NightTheme.buttonSelectedBorder,
    alignItems: 'center',
  },
  unSelectedButton: {
    backgroundColor: NightTheme.buttonUnselected,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NightTheme.buttonUnselected,
    borderRadius: '10px',
    alignItems: 'center',
  },
  optionText: {
    color: NightTheme.buttonText,
    fontSize: 15,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
});