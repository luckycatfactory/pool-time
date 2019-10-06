import React from 'react';
import { ONE_MINUTE } from '../constants';

const defaultValue = {
  registerConsumer: () => {},
  scale: ONE_MINUTE,
  time: Date.now(),
  unregisterConsumer: () => {},
};

const MinuteContext = React.createContext(defaultValue);

export default MinuteContext;
