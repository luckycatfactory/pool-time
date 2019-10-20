import validateDurationObject from '../validateDurationObject';
import { ONE_SECOND } from '../../durations';

describe('validateDurationObject()', () => {
  const generateDurationInput = (overrides = {}) => ({
    context: ONE_SECOND,
    key: 'oneSecond',
    value: 1,
    ...overrides,
  });

  it('allows for proper objects to pass', () => {
    expect(() => {
      validateDurationObject(generateDurationInput());
    }).not.toThrow();
  });

  describe('when failing validation', () => {
    it('fails properly when the input is not an object', () => {
      expect(() => {
        validateDurationObject([]);
      }).toThrow('Expected duration to be an object, but it was not.');
    });

    it('fails properly when there is no key', () => {
      expect(() => {
        validateDurationObject(generateDurationInput({ key: undefined }));
      }).toThrow('Expected duration object to have a key, but it did not.');
    });

    it('fails properly when the key is not a string', () => {
      expect(() => {
        validateDurationObject(generateDurationInput({ key: Symbol('NOT A STRING!') }));
      }).toThrow('Expected duration object key to be a string, but it was not.');
    });

    it('fails properly when the value is not a number', () => {
      expect(() => {
        validateDurationObject(generateDurationInput({ value: Symbol('NOT A NUMBER!') }));
      }).toThrow('Expected duration object value to be a number, but it was not.');
    });

    it('fails properly when there is no context', () => {
      expect(() => {
        validateDurationObject(generateDurationInput({ context: undefined }));
      }).toThrow('Expected duration object to have a React context, but it did not.');
    });
  });
});
