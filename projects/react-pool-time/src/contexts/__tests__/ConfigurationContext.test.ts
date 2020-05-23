import React from 'react';

import ConfigurationContext from '../ConfigurationContext';

jest.mock('react', () => ({
  createContext: jest.fn(() => ({})),
}));

describe('ConfigurationContext', () => {
  it('has the correct default value', () => {
    expect(React.createContext).toHaveBeenCalledTimes(1);
    const defaultContextValue = (React.createContext as jest.Mock).mock
      .calls[0][0];
    expect(defaultContextValue).toEqual({ accuracies: [] });

    const context = (React.createContext as jest.Mock).mock.results[0].value;

    expect(context).toBe(ConfigurationContext);
  });
});
