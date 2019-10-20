import validateAccuracyObject from '../validateAccuracyObject';
import validateDurationObject from '../validateDurationObject';
import { ONE_SECOND } from '../../durations';

jest.mock('../validateDurationObject', () => jest.fn(() => {}));

describe('validateAccuracyObject()', () => {
  const generateDurationInput = (overrides = {}) => ({
    difference: ONE_SECOND,
    ...overrides,
  });

  it('allows for proper objects to pass', () => {
    expect(() => {
      validateAccuracyObject(generateDurationInput());
    }).not.toThrow();
  });

  describe('when failing validation', () => {
    it('fails properly when the input is not an object', () => {
      expect(() => {
        validateAccuracyObject([]);
      }).toThrow('Expected accuracy entry to be an object, but it was not.');
    });

    it('fails properly when there is no difference', () => {
      expect(() => {
        validateAccuracyObject(generateDurationInput({ difference: undefined }));
      }).toThrow('Expected accuracy object to have a difference object, but it did not.');
    });

    it('fails properly when the difference is not an object', () => {
      expect(() => {
        validateAccuracyObject(generateDurationInput({ difference: [] }));
      }).toThrow('Expected accuracy object to have a difference object, but it did not.');
    });

    it('fails properly when the difference validation fails', () => {
      const mockDifferenceValidationErrorMessage = 'something went wrong';
      validateDurationObject.mockImplementationOnce(() => {
        throw new Error(mockDifferenceValidationErrorMessage);
      });
      expect(() => {
        validateAccuracyObject(generateDurationInput());
      }).toThrow(
        `Expected accuracy object to have a valid duration object, but it did not. Received the following error: ${mockDifferenceValidationErrorMessage}`
      );
    });
  });
});
