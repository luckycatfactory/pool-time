import React from 'react';
import generateTimeObject, {
  TimeObject,
  TimeObjectWithContext,
} from '../generateTimeObject';

jest.mock('react', () => ({
  createContext: jest.fn(() => ({})),
}));

const isTimeObjectWithContext = (
  timeObject: TimeObject
): timeObject is TimeObjectWithContext =>
  Object.prototype.hasOwnProperty.call(
    timeObject as TimeObjectWithContext,
    'context'
  );

describe('generateTimeObject()', () => {
  afterEach(() => {
    (React.createContext as jest.Mock).mockClear();
  });

  it('generates an object of the correct shape', () => {
    const mockKey = 'SIX_SECONDS';
    const mockValue = 6000;
    const timeObject = generateTimeObject(mockKey, mockValue);

    expect(isTimeObjectWithContext(timeObject)).toBe(true);

    expect(timeObject).toEqual({
      context: expect.any(Object),
      key: mockKey,
      value: mockValue,
    });

    expect(React.createContext).toHaveBeenCalledTimes(1);
    const lastCreatedContext = (React.createContext as jest.Mock).mock
      .results[0].value;

    if (isTimeObjectWithContext(timeObject)) {
      expect(timeObject.context).toBe(lastCreatedContext);
    }
  });

  it('generates an object of the correct shape when given POSITIVE_INFINITY', () => {
    const mockKey = 'HELL_FREEZES_OVER';
    const mockValue = Number.POSITIVE_INFINITY;
    const timeObject = generateTimeObject(mockKey, mockValue);

    expect(isTimeObjectWithContext(timeObject)).toBe(false);

    expect(timeObject).toEqual({
      key: mockKey,
      value: mockValue,
    });
  });

  describe('validation', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    describe('when not in production', () => {
      it('throws an error when given a value less than one second', () => {
        expect(() => {
          generateTimeObject('ALMOST_ONE_SECOND', 999);
        }).toThrow(
          'Invalid value provided to generateTimeObject. The value must be greater than or equal to 1000.'
        );
      });

      it('throws an error when given a value that is not a multiple of 1000', () => {
        expect(() => {
          generateTimeObject('ALMOST_ONE_SECOND', 1001);
        }).toThrow(
          'Invalid value provided to generateTimeObject. The value must be evenly divisible by 1000.'
        );
      });

      it('throws an error when given a value that is larger than a signed 32-bit integer', () => {
        expect(() => {
          generateTimeObject('TOO_LARGE', 2147483648);
        }).toThrow(
          'Invalid value provided to generateTimeObject. The value must be less than 2^31 - 1 = 2,147,483,647 since JavaScript intervals treat delays as signed 32-bit integers.'
        );
      });

      it('does not throw an error when given POSITIVE_INFINITY', () => {
        expect(() => {
          generateTimeObject('HELL_FREEZES_OVER', Number.POSITIVE_INFINITY);
        }).not.toThrow();
      });
    });

    describe('when in production', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('does not throw an error when given a value less than one second', () => {
        expect(() => {
          generateTimeObject('ALMOST_ONE_SECOND', 999);
        }).not.toThrow();
      });

      it('does not throw an error when given a value that is not a multiple of 1000', () => {
        expect(() => {
          generateTimeObject('ALMOST_ONE_SECOND', 1001);
        }).not.toThrow();
      });

      it('does not throw an error when given a value that is larger than a signed 32-bit integer', () => {
        expect(() => {
          generateTimeObject('TOO_LARGE', 2147483648);
        }).not.toThrow();
      });
    });
  });
});
