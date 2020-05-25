import React from 'react';
import { TimeContextValue } from '../utilities/generateTimeObject';

const ApplicationInitializationTimeContext = React.createContext<
  TimeContextValue
>({
  time: Date.now(),
  value: 0,
});

export default ApplicationInitializationTimeContext;
