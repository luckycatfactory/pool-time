import React from 'react';

const initialNow = Date.now();

const SecondContext = React.createContext(initialNow);

export default SecondContext;
