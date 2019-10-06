import React from 'react';
import { ONE_YEAR } from '../constants';

const defaultValue = {
  registerConsumer: () => {},
  scale: ONE_YEAR,
  time: Date.now(),
  unregisterConsumer: () => {},
};

const YearContext = React.createContext(defaultValue);

export default YearContext;
