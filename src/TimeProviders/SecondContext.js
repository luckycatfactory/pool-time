import React from 'react';
import { ONE_SECOND } from '../constants';

const defaultValue = {
  registerConsumer: () => {},
  scale: ONE_SECOND,
  time: Date.now(),
  unregisterConsumer: () => {},
};

const SecondContext = React.createContext(defaultValue);

export default SecondContext;
