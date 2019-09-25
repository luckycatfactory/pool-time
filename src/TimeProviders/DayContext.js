import React from 'react';
import { ONE_DAY } from '../constants';

const defaultValue = {
  scale: ONE_DAY,
  time: Date.now(),
};

const DayContext = React.createContext(defaultValue);

export default DayContext;
