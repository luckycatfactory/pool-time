import React from 'react';
import { ONE_HOUR } from '../constants';

const defaultValue = {
  scale: ONE_HOUR,
  time: Date.now(),
};

const HourContext = React.createContext(defaultValue);

export default HourContext;
