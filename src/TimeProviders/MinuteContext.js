import React from 'react';
import { ONE_MINUTE } from '../constants';

const defaultValue = {
  scale: ONE_MINUTE,
  time: Date.now(),
};

const MinuteContext = React.createContext(defaultValue);

export default MinuteContext;
