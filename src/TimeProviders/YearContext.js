import React from 'react';

const initialNow = Date.now();

const YearContext = React.createContext(initialNow);

export default YearContext;
