import AccuracyMap from '../';
import DurationList from '../../DurationList';
import {
  ONE_SECOND,
  FIVE_SECONDS,
  FIFTEEN_SECONDS,
  THIRTY_SECONDS,
  ONE_MINUTE,
  ONE_HOUR,
  ONE_DAY,
} from '../../durations';

describe('AccuracyMap', () => {
  const generateValidAccuracyList = () => [
    {
      difference: ONE_SECOND,
      maximumAccuracy: ONE_SECOND,
      minimumAccuracy: ONE_SECOND,
      preferredAccuracy: ONE_SECOND,
    },
  ];

  describe('initialization', () => {
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

  describe('getOptimalContext()', () => {
    describe('when not provided a local accuracy map', () => {
      it('properly fails when there is no entry for the specified duration', () => {
        const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
        ]);
        expect(() => {
          accuracyMap.getOptimalContext(ONE_SECOND);
        }).toThrow('Unable to find an appropriate entry for duration with key "oneSecond".');
      });

      it('returns the preferred accuracy in the simplest scenarios', () => {
        const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
        ]);
        expect(accuracyMap.getOptimalContext(ONE_MINUTE)).toBe(FIFTEEN_SECONDS.context);
      });

      it('properly inherits preferred accuracy', () => {
        const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE, ONE_HOUR]), [
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
        ]);
        expect(accuracyMap.getOptimalContext(ONE_HOUR)).toBe(FIFTEEN_SECONDS.context);
      });

      it('properly inherits preferred accuracy when there are higher specifications', () => {
        const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE, ONE_HOUR, ONE_DAY]), [
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
          {
            difference: ONE_DAY,
            maximumAccuracy: ONE_MINUTE,
            minimumAccuracy: ONE_HOUR,
            preferredAccuracy: ONE_HOUR,
          },
        ]);
        expect(accuracyMap.getOptimalContext(ONE_HOUR)).toBe(FIFTEEN_SECONDS.context);
      });
    });

    describe('when provded a local accuracy map', () => {
      it('properly fails when there is no entry for the specified duration', () => {
        const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
        ]);
        const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
        ]);
        expect(() => {
          accuracyMap.getOptimalContext(ONE_SECOND, localAccuracyMap);
        }).toThrow('Unable to find an appropriate entry for duration with key "oneSecond".');
      });

      describe('when the preferred local accuracy is within bounds of the global accuracy', () => {
        it('returns the local preferred accuracy when it is exactly the same as the global preferred accuracy', () => {
          const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
            {
              difference: ONE_MINUTE,
              maximumAccuracy: FIVE_SECONDS,
              minimumAccuracy: THIRTY_SECONDS,
              preferredAccuracy: FIFTEEN_SECONDS,
            },
          ]);
          const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
            {
              difference: ONE_MINUTE,
              maximumAccuracy: FIVE_SECONDS,
              minimumAccuracy: THIRTY_SECONDS,
              preferredAccuracy: FIFTEEN_SECONDS,
            },
          ]);
          expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
            FIFTEEN_SECONDS.context
          );
        });

        it('returns the local preferred accuracy when it is greater than the global preferred accuracy', () => {
          const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
            {
              difference: ONE_MINUTE,
              maximumAccuracy: FIVE_SECONDS,
              minimumAccuracy: THIRTY_SECONDS,
              preferredAccuracy: FIFTEEN_SECONDS,
            },
          ]);
          const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
            {
              difference: ONE_MINUTE,
              maximumAccuracy: FIVE_SECONDS,
              minimumAccuracy: THIRTY_SECONDS,
              preferredAccuracy: THIRTY_SECONDS,
            },
          ]);
          expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
            THIRTY_SECONDS.context
          );
        });

        it('returns the local preferred accuracy when it is less than the global preferred accuracy', () => {
          const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
            {
              difference: ONE_MINUTE,
              maximumAccuracy: FIVE_SECONDS,
              minimumAccuracy: THIRTY_SECONDS,
              preferredAccuracy: FIFTEEN_SECONDS,
            },
          ]);
          const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
            {
              difference: ONE_MINUTE,
              maximumAccuracy: FIVE_SECONDS,
              minimumAccuracy: THIRTY_SECONDS,
              preferredAccuracy: THIRTY_SECONDS,
            },
          ]);
          expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
            THIRTY_SECONDS.context
          );
        });
      });

      describe('when the preferred local accuracy is greater than the bound of the global accuracy', () => {
        describe('when the maximum local accuracy is within bounds of the global accuracy', () => {
          it('returns the local maximum accuracy when it is exactly the same as the global minimum accuracy', () => {
            const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: ONE_SECOND,
                minimumAccuracy: FIFTEEN_SECONDS,
                preferredAccuracy: FIVE_SECONDS,
              },
            ]);
            const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: FIFTEEN_SECONDS,
                minimumAccuracy: THIRTY_SECONDS,
                preferredAccuracy: THIRTY_SECONDS,
              },
            ]);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });

          it('returns the global minimum accuracy when the local maximum accuracy is less than the global minimum accuracy', () => {
            const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: ONE_SECOND,
                minimumAccuracy: THIRTY_SECONDS,
                preferredAccuracy: FIVE_SECONDS,
              },
            ]);
            const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: FIFTEEN_SECONDS,
                minimumAccuracy: ONE_MINUTE,
                preferredAccuracy: ONE_MINUTE,
              },
            ]);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              THIRTY_SECONDS.context
            );
          });
        });

        describe('when the maximum local accuracy is less than the bounds of the global accuracy', () => {
          it('returns the global minimum accuracy', () => {
            const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: FIVE_SECONDS,
                minimumAccuracy: FIVE_SECONDS,
                preferredAccuracy: FIVE_SECONDS,
              },
            ]);
            const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: ONE_SECOND,
                minimumAccuracy: ONE_MINUTE,
                preferredAccuracy: THIRTY_SECONDS,
              },
            ]);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIVE_SECONDS.context
            );
          });
        });
      });

      describe('when the preferred local accuracy is less than the bound of the global accuracy', () => {
        describe('when the minimum local accuracy is within bounds of the global accuracy', () => {
          it('returns the local minimum accuracy when it is exactly the same as the global maximum accuracy', () => {
            const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: FIFTEEN_SECONDS,
                minimumAccuracy: ONE_MINUTE,
                preferredAccuracy: THIRTY_SECONDS,
              },
            ]);
            const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: ONE_SECOND,
                minimumAccuracy: FIFTEEN_SECONDS,
                preferredAccuracy: ONE_SECOND,
              },
            ]);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });

          it('returns the global maximum accuracy when the local minimum accuracy is greater than the global minimum accuracy', () => {
            const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: FIFTEEN_SECONDS,
                minimumAccuracy: ONE_MINUTE,
                preferredAccuracy: THIRTY_SECONDS,
              },
            ]);
            const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: ONE_SECOND,
                minimumAccuracy: THIRTY_SECONDS,
                preferredAccuracy: ONE_SECOND,
              },
            ]);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });
        });

        describe('when the minimum local accuracy is greater than the bounds of the global accuracy', () => {
          it('returns the global maximum accuracy', () => {
            const accuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: FIFTEEN_SECONDS,
                minimumAccuracy: ONE_MINUTE,
                preferredAccuracy: THIRTY_SECONDS,
              },
            ]);
            const localAccuracyMap = new AccuracyMap(new DurationList([ONE_MINUTE]), [
              {
                difference: ONE_MINUTE,
                maximumAccuracy: ONE_SECOND,
                minimumAccuracy: ONE_HOUR,
                preferredAccuracy: ONE_SECOND,
              },
            ]);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });
        });
      });
    });
  });
});
