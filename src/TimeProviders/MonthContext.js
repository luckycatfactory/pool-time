import React from 'react';
import { ONE_MONTH } from '../constants';
import { generateTimeContextDefaultObject } from '../utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_MONTH);

const MonthContext = React.createContext(defaultValue);

export default MonthContext;
