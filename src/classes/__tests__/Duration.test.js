import React from 'react';

import Duration from '../Duration';

jest.mock('react', () => ({
  createContext: jest.fn(() => ({})),
}));

describe('Duration', () => {
  const generateInput = (overrides = {}) => ({
    key: 'oneSecond',
    value: 1000,
    ...overrides,
  });

  beforeEach(() => {
    React.createContext.mockClear();
  });

  describe('initialization', () => {
    it('properly fails if the input is not an object', () => {
      expect(() => {
        new Duration([]);
      }).toThrow('Expected duration to be an object, but it was not.');
    });

    it('properly fails if the input does not have a key', () => {
      expect(() => {
        new Duration(generateInput({ key: undefined }));
      }).toThrow('Expected duration object to have a key, but it did not.');
    });

    it('properly fails if the input key is not a string', () => {
      expect(() => {
        new Duration(generateInput({ key: Symbol('NOT A STRING') }));
      }).toThrow('Expected duration object key to be a string, but it was not.');
    });

    it('properly fails if the input does not have a value', () => {
      expect(() => {
        new Duration(generateInput({ value: undefined }));
      }).toThrow('Expected duration object to have a value, but it did not.');
    });

    it('properly fails if the input value is not a number', () => {
      expect(() => {
        new Duration(generateInput({ value: Symbol('NOT A NUMBER') }));
      }).toThrow('Expected duration object value to be a number, but it was not.');
    });
  });

  it.each([['key', 'value']])('properly exposes %s', key => {
    const input = generateInput();
    const duration = new Duration(input);
    expect(duration[key]).toBe(input[key]);
  });

  it('creates and exposes a proper context', () => {
    const input = generateInput();
    const duration = new Duration(input);
    expect(React.createContext).toHaveBeenCalledTimes(1);
    const lastCreateContextResult = React.createContext.mock.results[0].value;
    expect(duration.context).toBe(lastCreateContextResult);
  });
});
