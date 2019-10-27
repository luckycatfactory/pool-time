import AccuracyMap from '../AccuracyMap';
import AccuracyList from '../AccuracyList';
import DurationList from '../DurationList';
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
  const generateValidAccuracyList = () =>
    new AccuracyList([
      {
        difference: ONE_SECOND,
        maximumAccuracy: ONE_SECOND,
        minimumAccuracy: ONE_SECOND,
        preferredAccuracy: ONE_SECOND,
      },
    ]);

  describe('initialization', () => {
    it('properly fails when the input durations are not a DurationList', () => {
      expect(() => {
        new AccuracyMap([], generateValidAccuracyList());
      }).toThrow('Expected durations to be a DurationList, but it was not.');
    });

    it('properly fails when the accuracy specification is not an AccuracyList', () => {
      expect(() => {
        new AccuracyMap(new DurationList([]), {});
      }).toThrow('Expected accuracy list to be an instance of AccuracyList, but it was not.');
    });

    it('properly fails when the accuracy list does not begin with the shortest duration', () => {
      expect(() => {
        new AccuracyMap(
          new DurationList([ONE_SECOND, ONE_MINUTE]),
          new AccuracyList([{ difference: ONE_MINUTE, preferredAccuracy: ONE_MINUTE }])
        );
      }).toThrow(
        'Accuracy specifications must begin with the shortest duration passed to the TimeProviders.'
      );
    });

    it('properly fails when one of the accuracy entries specifies an accuracy duration that is not provided in the duration list', () => {
      expect(() => {
        new AccuracyMap(
          new DurationList([ONE_MINUTE]),
          new AccuracyList([
            {
              difference: ONE_MINUTE,
              maximumAccuracy: ONE_SECOND,
              minimumAccuracy: ONE_MINUTE,
              preferredAccuracy: ONE_SECOND,
            },
          ])
        );
      }).toThrow(
        'Invalid accuracy of oneSecond passed for differences of oneMinute. All accuracy specifications must have corresponding durations passed to the TimeProviders.'
      );
    });
  });

  describe('getOptimalContext()', () => {
    const generateValidDurationListAndAccuracyList = (
      accuracyListMapper = list => list,
      otherDurations = []
    ) => ({
      accuracyList: new AccuracyList(
        accuracyListMapper([
          {
            difference: FIVE_SECONDS,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: FIVE_SECONDS,
            preferredAccuracy: FIVE_SECONDS,
          },
          {
            difference: ONE_MINUTE,
            maximumAccuracy: FIVE_SECONDS,
            minimumAccuracy: THIRTY_SECONDS,
            preferredAccuracy: FIFTEEN_SECONDS,
          },
        ])
      ),
      durationList: new DurationList([
        FIVE_SECONDS,
        FIFTEEN_SECONDS,
        THIRTY_SECONDS,
        ONE_MINUTE,
        ...otherDurations,
      ]),
    });

    describe('when not provided a local accuracy map', () => {
      it('properly fails when there is no entry for the specified duration', () => {
        const { accuracyList, durationList } = generateValidDurationListAndAccuracyList();
        const accuracyMap = new AccuracyMap(durationList, accuracyList);
        expect(() => {
          accuracyMap.getOptimalContext(ONE_SECOND);
        }).toThrow('Unable to find an appropriate entry for duration with key "oneSecond".');
      });

      it('returns the preferred accuracy in the simplest scenarios', () => {
        const { accuracyList, durationList } = generateValidDurationListAndAccuracyList();
        const accuracyMap = new AccuracyMap(durationList, accuracyList);
        expect(accuracyMap.getOptimalContext(ONE_MINUTE)).toBe(FIFTEEN_SECONDS.context);
      });

      it('properly inherits preferred accuracy', () => {
        const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(undefined, [
          ONE_HOUR,
        ]);
        const accuracyMap = new AccuracyMap(durationList, accuracyList);
        expect(accuracyMap.getOptimalContext(ONE_HOUR)).toBe(FIFTEEN_SECONDS.context);
      });

      it('properly inherits preferred accuracy when there are higher specifications', () => {
        const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(undefined, [
          ONE_HOUR,
          ONE_DAY,
        ]);
        const accuracyMap = new AccuracyMap(durationList, accuracyList);
        expect(accuracyMap.getOptimalContext(ONE_HOUR)).toBe(FIFTEEN_SECONDS.context);
      });
    });

    describe('when provded a local accuracy map', () => {
      it('properly fails when there is no entry for the specified duration', () => {
        const { accuracyList, durationList } = generateValidDurationListAndAccuracyList();
        const accuracyMap = new AccuracyMap(durationList, accuracyList);
        const localAccuracyMap = new AccuracyMap(durationList, accuracyList);
        expect(() => {
          accuracyMap.getOptimalContext(ONE_SECOND, localAccuracyMap);
        }).toThrow('Unable to find an appropriate entry for duration with key "oneSecond".');
      });

      describe('when the preferred local accuracy is within bounds of the global accuracy', () => {
        it('returns the local preferred accuracy when it is exactly the same as the global preferred accuracy', () => {
          const { accuracyList, durationList } = generateValidDurationListAndAccuracyList();
          const accuracyMap = new AccuracyMap(durationList, accuracyList);
          const localAccuracyMap = new AccuracyMap(durationList, accuracyList);
          expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
            FIFTEEN_SECONDS.context
          );
        });

        it('returns the local preferred accuracy when it is greater than the global preferred accuracy', () => {
          const { accuracyList, durationList } = generateValidDurationListAndAccuracyList();
          const accuracyMap = new AccuracyMap(durationList, accuracyList);
          const {
            accuracyList: localAccuracyList,
            durationList: localDurationList,
          } = generateValidDurationListAndAccuracyList(list =>
            list.map(entry =>
              entry.difference === ONE_MINUTE
                ? { ...entry, preferredAccuracy: THIRTY_SECONDS }
                : entry
            )
          );
          const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
          expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
            THIRTY_SECONDS.context
          );
        });

        it('returns the local preferred accuracy when it is less than the global preferred accuracy', () => {
          const { accuracyList, durationList } = generateValidDurationListAndAccuracyList();
          const accuracyMap = new AccuracyMap(durationList, accuracyList);
          const {
            accuracyList: localAccuracyList,
            durationList: localDurationList,
          } = generateValidDurationListAndAccuracyList(list =>
            list.map(entry =>
              entry.difference === ONE_MINUTE
                ? { ...entry, preferredAccuracy: FIVE_SECONDS }
                : entry
            )
          );
          const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
          expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
            FIVE_SECONDS.context
          );
        });
      });

      describe('when the preferred local accuracy is greater than the bound of the global accuracy', () => {
        describe('when the maximum local accuracy is within bounds of the global accuracy', () => {
          it('returns the local maximum accuracy when it is exactly the same as the global minimum accuracy', () => {
            const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIVE_SECONDS,
                      minimumAccuracy: FIFTEEN_SECONDS,
                      preferredAccuracy: FIVE_SECONDS,
                    }
                  : entry
              )
            );
            const accuracyMap = new AccuracyMap(durationList, accuracyList);
            const {
              accuracyList: localAccuracyList,
              durationList: localDurationList,
            } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIFTEEN_SECONDS,
                      minimumAccuracy: THIRTY_SECONDS,
                      preferredAccuracy: THIRTY_SECONDS,
                    }
                  : entry
              )
            );
            const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });

          it('returns the global minimum accuracy when the local maximum accuracy is less than the global minimum accuracy', () => {
            const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIVE_SECONDS,
                      minimumAccuracy: THIRTY_SECONDS,
                      preferredAccuracy: FIVE_SECONDS,
                    }
                  : entry
              )
            );
            const accuracyMap = new AccuracyMap(durationList, accuracyList);
            const {
              accuracyList: localAccuracyList,
              durationList: localDurationList,
            } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIFTEEN_SECONDS,
                      minimumAccuracy: ONE_MINUTE,
                      preferredAccuracy: ONE_MINUTE,
                    }
                  : entry
              )
            );
            const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              THIRTY_SECONDS.context
            );
          });
        });

        describe('when the maximum local accuracy is less than the bounds of the global accuracy', () => {
          it('returns the global minimum accuracy', () => {
            const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIFTEEN_SECONDS,
                      minimumAccuracy: FIFTEEN_SECONDS,
                      preferredAccuracy: FIFTEEN_SECONDS,
                    }
                  : entry
              )
            );
            const accuracyMap = new AccuracyMap(durationList, accuracyList);
            const {
              accuracyList: localAccuracyList,
              durationList: localDurationList,
            } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIVE_SECONDS,
                      minimumAccuracy: ONE_MINUTE,
                      preferredAccuracy: THIRTY_SECONDS,
                    }
                  : entry
              )
            );
            const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });
        });
      });

      describe('when the preferred local accuracy is less than the bound of the global accuracy', () => {
        describe('when the minimum local accuracy is within bounds of the global accuracy', () => {
          it('returns the local minimum accuracy when it is exactly the same as the global maximum accuracy', () => {
            const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: THIRTY_SECONDS,
                      minimumAccuracy: ONE_MINUTE,
                      preferredAccuracy: ONE_MINUTE,
                    }
                  : entry
              )
            );
            const accuracyMap = new AccuracyMap(durationList, accuracyList);
            const {
              accuracyList: localAccuracyList,
              durationList: localDurationList,
            } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIVE_SECONDS,
                      minimumAccuracy: FIFTEEN_SECONDS,
                      preferredAccuracy: FIVE_SECONDS,
                    }
                  : entry
              )
            );
            const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });

          it('returns the global maximum accuracy when the local minimum accuracy is greater than the global minimum accuracy', () => {
            const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIFTEEN_SECONDS,
                      minimumAccuracy: ONE_MINUTE,
                      preferredAccuracy: ONE_MINUTE,
                    }
                  : entry
              )
            );
            const accuracyMap = new AccuracyMap(durationList, accuracyList);
            const {
              accuracyList: localAccuracyList,
              durationList: localDurationList,
            } = generateValidDurationListAndAccuracyList(list =>
              list.map(entry =>
                entry.difference === ONE_MINUTE
                  ? {
                      ...entry,
                      maximumAccuracy: FIVE_SECONDS,
                      minimumAccuracy: THIRTY_SECONDS,
                      preferredAccuracy: FIVE_SECONDS,
                    }
                  : entry
              )
            );
            const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });
        });

        describe('when the minimum local accuracy is greater than the bounds of the global accuracy', () => {
          it('returns the global maximum accuracy', () => {
            const { accuracyList, durationList } = generateValidDurationListAndAccuracyList(
              list =>
                list.map(entry =>
                  entry.difference === ONE_MINUTE
                    ? {
                        ...entry,
                        maximumAccuracy: FIFTEEN_SECONDS,
                        minimumAccuracy: ONE_MINUTE,
                        preferredAccuracy: THIRTY_SECONDS,
                      }
                    : entry
                ),
              [ONE_HOUR]
            );
            const accuracyMap = new AccuracyMap(durationList, accuracyList);
            const {
              accuracyList: localAccuracyList,
              durationList: localDurationList,
            } = generateValidDurationListAndAccuracyList(
              list =>
                list.map(entry =>
                  entry.difference === ONE_MINUTE
                    ? {
                        ...entry,
                        maximumAccuracy: FIVE_SECONDS,
                        minimumAccuracy: ONE_HOUR,
                        preferredAccuracy: FIVE_SECONDS,
                      }
                    : entry
                ),
              [ONE_HOUR]
            );
            const localAccuracyMap = new AccuracyMap(localDurationList, localAccuracyList);
            expect(accuracyMap.getOptimalContext(ONE_MINUTE, localAccuracyMap)).toBe(
              FIFTEEN_SECONDS.context
            );
          });
        });
      });
    });
  });
});
