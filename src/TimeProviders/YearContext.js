import React from 'react';
import { ONE_YEAR } from '../constants';

const defaultValue = {
  scale: ONE_YEAR,
  time: Date.now(),
};

const YearContext = React.createContext(defaultValue);

export default YearContext;
