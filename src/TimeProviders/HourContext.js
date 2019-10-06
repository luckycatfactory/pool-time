import React from 'react';
import { ONE_HOUR } from '../constants';

const defaultValue = {
  registerConsumer: () => {},
  scale: ONE_HOUR,
  time: Date.now(),
  unregisterConsumer: () => {},
};

const HourContext = React.createContext(defaultValue);

export default HourContext;
