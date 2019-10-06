import React from 'react';
import { ONE_MONTH } from '../constants';

const defaultValue = {
  registerConsumer: () => {},
  scale: ONE_MONTH,
  time: Date.now(),
  unregisterConsumer: () => {},
};

const MonthContext = React.createContext(defaultValue);

export default MonthContext;
