import React from 'react';

export interface BaseTimeObject {
  readonly key: string;
  readonly value: number;
}

export interface TimeContextValue {
  readonly time: number;
  readonly value: number;
}

export interface TimeObjectWithContext extends BaseTimeObject {
  readonly context: React.Context<TimeContextValue>;
}

export type TimeObject = TimeObjectWithContext | BaseTimeObject;

const generateTimeObject = (
  key: string,
  value: number
): TimeObjectWithContext => {
  if (process.env.NODE_ENV !== 'production') {
    if (value < 1000) {
      throw new Error(
        'Invalid value provided to generateTimeObject. The value must be greater than or equal to 1000.'
      );
    }
    if (value > 2147483647) {
      throw new Error(
        'Invalid value provided to generateTimeObject. The value must be less than 2^31 - 1 = 2,147,483,647 since JavaScript intervals treat delays as signed 32-bit integers.'
      );
    }
    if (value % 1000 !== 0) {
      throw new Error(
        'Invalid value provided to generateTimeObject. The value must be evenly divisible by 1000.'
      );
    }
  }

  return {
    context: React.createContext({ time: Date.now(), value }),
    key,
    value,
  };
};

export default generateTimeObject;
