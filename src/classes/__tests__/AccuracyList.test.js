import AccuracyList from '../AccuracyList';
import AccuracyEntry from '../AccuracyEntry';
import { ONE_SECOND, ONE_MINUTE } from '../../durations';

describe('AccuracyList', () => {
  describe('initialization', () => {
    it('properly fails if given input that is not an array', () => {
      expect(() => {
        new AccuracyList({});
      }).toThrow('Expected accuracy list input to be an array, but it was not.');
    });

    it('properly fails if some of the array elements are not valid accuracy entries', () => {
      expect(() => {
        new AccuracyList([
          {
            difference: ONE_MINUTE,
          },
        ]);
      }).toThrow('Expected accuracy entry to have a specified preferredAccuracy, but it did not.');
    });

    it('properly fails if some of the array elements are not in ascending order', () => {
      expect(() => {
        new AccuracyList([
          {
            difference: ONE_MINUTE,
            preferredAccuracy: ONE_MINUTE,
          },
          {
            difference: ONE_SECOND,
            preferredAccuracy: ONE_SECOND,
          },
        ]);
      }).toThrow('Expected accuracy entries to be in ascending order, but they were not.');
    });
  });
});
