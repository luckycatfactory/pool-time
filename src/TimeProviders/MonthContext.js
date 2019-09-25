import React from 'react';

const initialNow = Date.now();

const MonthContext = React.createContext(initialNow);

export default MonthContext;
