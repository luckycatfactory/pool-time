import React from 'react';
import { ONE_DAY } from '../durations';
import { generateTimeContextDefaultObject } from './utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_DAY);

const DayContext = React.createContext(defaultValue);

export default DayContext;
