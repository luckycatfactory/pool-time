import React from 'react';
import { ONE_MINUTE } from '../durations';
import { generateTimeContextDefaultObject } from './utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_MINUTE);

const MinuteContext = React.createContext(defaultValue);

export default MinuteContext;
