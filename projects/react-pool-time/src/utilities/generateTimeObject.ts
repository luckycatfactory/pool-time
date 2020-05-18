import React from 'react';

export interface TimeObjectContextValue {
  readonly time: number;
  readonly value: number;
}

export interface TimeObject {
  readonly context: React.Context<TimeObjectContextValue>;
  readonly key: string;
  readonly value: number;
}

const generateTimeObject = (key: string, value: number): TimeObject => ({
  context: React.createContext({ time: Date.now(), value }),
  key,
  value,
});

export default generateTimeObject;
