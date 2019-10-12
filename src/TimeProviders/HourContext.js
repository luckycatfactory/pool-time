import React from 'react';
import { ONE_HOUR } from '../durations';
import { generateTimeContextDefaultObject } from './utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_HOUR);

const HourContext = React.createContext(defaultValue);

export default HourContext;
