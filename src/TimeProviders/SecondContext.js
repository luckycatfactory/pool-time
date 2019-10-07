import React from 'react';
import { ONE_SECOND } from '../constants';
import { generateTimeContextDefaultObject } from './utilities';

const defaultValue = generateTimeContextDefaultObject(ONE_SECOND);

const SecondContext = React.createContext(defaultValue);

export default SecondContext;
