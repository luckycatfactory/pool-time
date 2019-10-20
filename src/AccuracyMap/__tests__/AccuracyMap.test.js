import AccuracyMap from '../';
import DurationList from '../../DurationList';
import { ONE_SECOND, ONE_MINUTE } from '../../durations';

describe('AccuracyMap', () => {
  const generateValidAccuracyList = () => [
    {
      difference: ONE_SECOND,
      maximumAccuracy: ONE_SECOND,
      minimumAccuracy: ONE_SECOND,
      preferredAccuracy: ONE_SECOND,
    },
  ];

  describe('validations', () => {
    it('properly fails when the input durations are not a DurationList', () => {
      expect(() => {
        new AccuracyMap([], generateValidAccuracyList());
      }).toThrow('Expected durations to be a DurationList, but it was not.');
    });

    it('properly fails when the accuracy specification is not an array', () => {
      expect(() => {
        new AccuracyMap(new DurationList([]), {});
      }).toThrow('Expected accuracy specification to be an array, but it was not.');
    });

    it('properly fails when the accuracy specification has invalid accuracy objects', () => {
      expect(() => {
        new AccuracyMap(new DurationList([ONE_SECOND]), {});
      }).toThrow('Expected accuracy specification to be an array, but it was not.');
    });

    it('properly fails when the accuracy list is not in ascending order', () => {
      expect(() => {
        new AccuracyMap(new DurationList([ONE_SECOND, ONE_MINUTE]), [
          { difference: ONE_MINUTE },
          { difference: ONE_SECOND },
        ]);
      }).toThrow(
        'Expected accuracy specification to be in ascending order by difference, but it was not.'
      );
    });

    it('properly fails when the accuracy list does not begin with the shortest duration', () => {
      expect(() => {
        new AccuracyMap(new DurationList([ONE_SECOND, ONE_MINUTE]), [{ difference: ONE_MINUTE }]);
      }).toThrow(
        'Accuracy specifications must begin with the shortest duration passed to the TimeProviders.'
      );
    });
  });
});
