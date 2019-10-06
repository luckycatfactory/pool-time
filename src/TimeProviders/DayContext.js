import React from 'react';
import { ONE_DAY } from '../constants';

const defaultValue = {
  registerConsumer: () => {},
  scale: ONE_DAY,
  time: Date.now(),
  unregisterConsumer: () => {},
};

const DayContext = React.createContext(defaultValue);

export default DayContext;
