import React from 'react';
import { ONE_YEAR } from '../constants';
import { generateTimeContextDefaultObject } from './utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_YEAR);

const YearContext = React.createContext(defaultValue);

export default YearContext;
