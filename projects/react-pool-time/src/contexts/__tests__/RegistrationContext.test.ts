import React from 'react';

import RegistrationContext from '../RegistrationContext';

jest.mock('react', () => ({
  createContext: jest.fn(() => ({})),
}));

describe('RegistrationContext', () => {
  it('has the correct default value', () => {
    expect(React.createContext).toHaveBeenCalledTimes(1);
    const defaultContextValue = (React.createContext as jest.Mock).mock
      .calls[0][0];
    expect(defaultContextValue()).toEqual({ unregister: expect.any(Function) });
    expect(defaultContextValue().unregister()).toBe(undefined);

    const context = (React.createContext as jest.Mock).mock.results[0].value;

    expect(context).toBe(RegistrationContext);
  });
});
