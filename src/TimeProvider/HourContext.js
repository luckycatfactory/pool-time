import React from 'react';

const initialNow = Date.now();

const HourContext = React.createContext(initialNow);

export default HourContext;
