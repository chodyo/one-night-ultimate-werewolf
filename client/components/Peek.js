import * as React from 'react';
import { Button, Text } from 'react-native';
import Modal from '@bit/nexxtway.react-rainbow.modal';

const Peek = ({ title, message, isOpen, onOpen, onClose }) => (
  <>
    <Button id="peek-btn" title={title} onPress={onOpen} />
    <Modal id="peek-modal" isOpen={isOpen} onRequestClose={onClose}>
      <Text>{message}</Text>
    </Modal>
  </>
);

export default Peek;
