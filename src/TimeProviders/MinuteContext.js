import React from 'react';
import { ONE_MINUTE } from '../constants';
import { generateTimeContextDefaultObject } from './utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_MINUTE);

const MinuteContext = React.createContext(defaultValue);

export default MinuteContext;
