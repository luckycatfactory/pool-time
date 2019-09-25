import React from 'react';
import { ONE_MONTH } from '../constants';

const defaultValue = {
  scale: ONE_MONTH,
  time: Date.now(),
};

const MonthContext = React.createContext(defaultValue);

export default MonthContext;
