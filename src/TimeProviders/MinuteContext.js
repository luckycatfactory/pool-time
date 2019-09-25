import React from 'react';

const initialNow = Date.now();

const MinuteContext = React.createContext(initialNow);

export default MinuteContext;
