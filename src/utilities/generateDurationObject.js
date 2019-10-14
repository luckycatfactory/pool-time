import React from 'react';
import generateTimeContextDefaultObject from '../utilities/generateTimeContextDefaultObject';

const generateDurationObject = (key, value) => {
  const durationObject = {
    key,
    value,
  };

  const defaultContextValue = generateTimeContextDefaultObject(durationObject);
  const context = React.createContext(defaultContextValue);

  durationObject.context = context;

  return durationObject;
};

export default generateDurationObject;
