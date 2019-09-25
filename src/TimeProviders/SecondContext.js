import React from 'react';
import { ONE_SECOND } from '../constants';

const defaultValue = {
  scale: ONE_SECOND,
  time: Date.now(),
};

const SecondContext = React.createContext(defaultValue);

export default SecondContext;
