import AccuracyEntry from '../AccuracyEntry';
import { FIVE_SECONDS, FIFTEEN_SECONDS, THIRTY_SECONDS, ONE_MINUTE } from '../../durations';

describe('AccuracyEntry', () => {
  const generateSpecification = (overrides = {}) => ({
    difference: ONE_MINUTE,
    maximumAccuracy: FIVE_SECONDS,
    minimumAccuracy: THIRTY_SECONDS,
    preferredAccuracy: FIFTEEN_SECONDS,
    ...overrides,
  });

  describe('initialization', () => {
    it('properly fails if not provided a difference', () => {
      expect(() => {
        new AccuracyEntry(generateSpecification({ difference: undefined }));
      }).toThrow('Expected accuracy entry to have a specified difference, but it did not.');
    });

    it.each([['difference'], ['maximumAccuracy'], ['minimumAccuracy'], ['preferredAccuracy']])(
      'properly fails if the provided %s is not a duration object',
      key => {
        expect(() => {
          new AccuracyEntry(generateSpecification({ [key]: 'NOT A DURATION' }));
        }).toThrow(`Expected ${key} to be a duration object, but it was not.`);
      }
    );

    it('properly fails if not provided a preferredAccuracy', () => {
      expect(() => {
        new AccuracyEntry(generateSpecification({ preferredAccuracy: undefined }));
      }).toThrow('Expected accuracy entry to have a specified preferredAccuracy, but it did not.');
    });

    it('properly fails if the maximumAccuracy value is greater than the minimumAccuracy value', () => {
      expect(() => {
        new AccuracyEntry(
          generateSpecification({
            maximumAccuracy: THIRTY_SECONDS,
            minimumAccuracy: FIFTEEN_SECONDS,
          })
        );
      }).toThrow(
        'Expected the minimum accuracy duration to be greater than or equal to that of the maximum accuracy, but it was not.'
      );
    });

    it('properly fails if the maximumAccuracy value is greater than the preferredAccuracy value', () => {
      expect(() => {
        new AccuracyEntry(
          generateSpecification({
            maximumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          })
        );
      }).toThrow(
        'Expected the maximum accuracy duration to be less than or equal to that of the preferred accuracy, but it was not.'
      );
    });

    it('properly fails if the maximumAccuracy value is greater than the preferredAccuracy value', () => {
      expect(() => {
        new AccuracyEntry(
          generateSpecification({
            minimumAccuracy: FIVE_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          })
        );
      }).toThrow(
        'Expected the minimum accuracy duration to be greater than or equal to that of the preferred accuracy, but it was not.'
      );
    });
  });

  it.each([['difference'], ['maximumAccuracy'], ['minimumAccuracy'], ['preferredAccuracy']])(
    'properly exposes %s as a value',
    key => {
      const specification = generateSpecification();
      const accuracyEntry = new AccuracyEntry(specification);
      expect(accuracyEntry[key]).toBe(specification[key]);
    }
  );
});
