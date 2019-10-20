import useValidatedAccuracy from '../useValidatedAccuracy';
import validateAccuracyObject from '../../utilities/validateAccuracyObject';
import { ONE_SECOND } from '../../durations';

jest.mock('../../utilities/validateAccuracyObject', () => jest.fn(() => {}));

describe('useValidatedAccuracy()', () => {
  const accuracy = [
    {
      difference: ONE_SECOND,
    },
  ];

  it('returns the accuracy settings', () => {
    const validatedAccuracy = useValidatedAccuracy(accuracy);
    expect(validatedAccuracy).toBe(accuracy);
  });

  describe('validation', () => {
    it('properly fails when not passed an array', () => {
      expect(() => {
        useValidatedAccuracy({});
      }).toThrow('Expected accuracy to be an array, but it was not.');
    });

    it('properly fails when an accuracy object fails accuracy object validation', () => {
      const mockErrorMessage = 'mock error message';
      validateAccuracyObject.mockImplementationOnce(() => {
        throw new Error(mockErrorMessage);
      });
      expect(() => {
        useValidatedAccuracy(accuracy);
      }).toThrow(mockErrorMessage);
    });
  });
});
