import React from 'react';

const initialNow = Date.now();

const DayContext = React.createContext(initialNow);

export default DayContext;
