import React from 'react';
import { ONE_MINUTE } from '../durations';

const defaultValue = ONE_MINUTE;

const GlobalMinimumAccuracyContext = React.createContext(defaultValue);

export default GlobalMinimumAccuracyContext;
