import PoolTime, {
  BaseTimeObject,
  CoreAccuracyEntry,
  CoreConfiguration,
  ETERNITY,
} from '../index';

describe('PoolTime', () => {
  describe('validation', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    type TestAccuracyEntry = CoreAccuracyEntry<BaseTimeObject>;
    type TestConfiguration = CoreConfiguration<BaseTimeObject>;

    interface ReactLikeTimeObject extends BaseTimeObject {
      readonly context: object;
    }

    interface InvalidConfigurationScenario {
      readonly configuration: TestConfiguration;
      readonly errorMessage: string;
      readonly title: string;
    }

    const ONE_SECOND: BaseTimeObject = {
      key: 'ONE_SECOND',
      value: 1000,
    };
    const FIVE_SECONDS: BaseTimeObject = {
      key: 'FIVE_SECONDS',
      value: 1000 * 5,
    };
    const TEN_SECONDS: BaseTimeObject = {
      key: 'TEN_SECONDS',
      value: 1000 * 10,
    };
    const ONE_MINUTE: BaseTimeObject = {
      key: 'ONE_MINUTE',
      value: 1000 * 60,
    };

    const ONE_REACT_LIKE_SECOND: ReactLikeTimeObject = {
      ...ONE_SECOND,
      context: {},
    };
    const FIVE_REACT_LIKE_SECONDS: ReactLikeTimeObject = {
      ...FIVE_SECONDS,
      context: {},
    };

    const invalidConfigurationScenarios: InvalidConfigurationScenario[] = [
      {
        configuration: {} as TestConfiguration,
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not present.',
        title: 'when provided a configuration object without accuracies',
      },
      {
        configuration: { accuracies: {} } as TestConfiguration,
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not an array.',
        title:
          'when provided a configuration object where accuracies is not an array',
      },
      {
        configuration: { accuracies: [] },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was an empty array.',
        title:
          'when provided a configuration object where accuracies is an empty array',
      },
      {
        configuration: { accuracies: [{} as TestAccuracyEntry] },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected accuracy entry to have keys for "upTo" and "within" with time objects as values, but instead received: {}.',
        title:
          'when provided an accuracy entry that does not have exactly the correct keys',
      },
      {
        configuration: {
          accuracies: [
            {
              extraKey: ONE_SECOND,
              upTo: ETERNITY,
              within: ONE_SECOND,
            } as TestAccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected accuracy entry to have keys for "upTo" and "within" with time objects as values, but instead received: {"extraKey":"[object Object]","upTo":"[object Object]","within":"[object Object]"}.',
        title:
          'when provided an accuracy entry that does not have exactly the correct keys',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: {
                value: 1000,
              } as BaseTimeObject,
              within: ONE_SECOND,
            } as TestAccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a key and value, but instead received: {"value":1000}.',
        title:
          'when provided an accuracy entry that does not have exactly the correct keys',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ETERNITY,
              within: {
                key: 'BAD_TIME_OBJECT_MISSING_A_VALUE',
              } as BaseTimeObject,
            } as TestAccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a key and value, but instead received: {"key":"BAD_TIME_OBJECT_MISSING_A_VALUE"}.',
        title:
          'when provided an accuracy entry that does not have exactly the correct keys',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ETERNITY,
              within: ONE_SECOND,
            },
            {
              upTo: ETERNITY,
              within: ONE_MINUTE,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected all accuracy entries to have unique upTo time values, but found duplicate entry on ETERNITY.',
        title:
          'when provided an accuracy list that contains duplicate upTo values',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ONE_MINUTE,
              within: ONE_SECOND,
            },
            {
              upTo: ETERNITY,
              within: ONE_SECOND,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected all accuracy entries to have unique within time values, but found duplicate entry on ONE_SECOND.',
        title:
          'when provided an accuracy list that contains duplicate within values',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ETERNITY,
              within: ONE_SECOND,
            },
            {
              upTo: ONE_MINUTE,
              within: ONE_MINUTE,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Accuracies must be sorted such that every upTo is greater than the upTo of the previous entry. Found ETERNITY placed before ONE_MINUTE.',
        title:
          'when provided an accuracy list that is not in ascending order by upTo',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ONE_MINUTE,
              within: FIVE_SECONDS,
            },
            {
              upTo: ETERNITY,
              within: ONE_SECOND,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Accuracies must be sorted such that every within is greater than the within of the previous entry. Found FIVE_SECONDS placed before ONE_SECOND.',
        title:
          'when provided an accuracy list that is not in ascending order by within',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: FIVE_SECONDS,
              within: TEN_SECONDS,
            },
            {
              upTo: ETERNITY,
              within: ONE_MINUTE,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Accuracy entries must always have within values that are less than or equal to their own upTo values. Found an entry with an upTo of FIVE_SECONDS that had a within of TEN_SECONDS.',
        title:
          'when provided an accuracy entry that has a greater within than its own upTo',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ONE_MINUTE,
              within: ONE_SECOND,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Accuracy lists must terminate with an entry with an upTo of ETERNITY.',
        title:
          'when provided an accuracy list that does not terminate with an upTo of ETERNITY',
      },
    ];

    describe.each([['test'], ['development']])('when in %s', (environment) => {
      beforeEach(() => {
        process.env.NODE_ENV = environment;
      });

      it('does not throw an error when valid configurations are provided', () => {
        expect(() => {
          new PoolTime({
            configuration: {
              accuracies: [
                {
                  upTo: ETERNITY,
                  within: ONE_SECOND,
                },
              ],
            },
          });
        }).not.toThrow();
      });

      it.each(
        invalidConfigurationScenarios.map((scenario) => [
          scenario.title,
          scenario.configuration,
          scenario.errorMessage,
        ])
      )(
        'does not throw an error %s',
        (
          title: string,
          configuration: TestConfiguration,
          errorMessage: string
        ) => {
          expect(() => {
            new PoolTime({ configuration });
          }).toThrow(errorMessage);
        }
      );

      it('properly invokes the passed onAccuracyEntryValidation callback', () => {
        const validator = jest.fn();
        const accuracies = [
          {
            upTo: ONE_MINUTE,
            within: {
              key: ONE_SECOND.key,
              value: ONE_SECOND.value,
            } as ReactLikeTimeObject,
          },
          {
            upTo: ETERNITY,
            within: FIVE_REACT_LIKE_SECONDS,
          },
        ];

        new PoolTime<ReactLikeTimeObject>({
          configuration: {
            accuracies,
          },
          onAccuracyEntryValidation: validator,
        });

        expect(validator).toHaveBeenCalledTimes(2);
        expect(validator.mock.calls).toEqual([
          [accuracies[0]],
          [accuracies[1]],
        ]);
      });
    });

    describe('when in production', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('does not throw an error when valid configurations are provided', () => {
        expect(() => {
          new PoolTime<ReactLikeTimeObject>({
            configuration: {
              accuracies: [
                {
                  upTo: ETERNITY,
                  within: ONE_REACT_LIKE_SECOND,
                },
              ],
            },
          });
        }).not.toThrow();
      });

      it.each(
        invalidConfigurationScenarios.map((scenario) => [
          scenario.title,
          scenario.configuration,
          scenario.errorMessage,
        ])
      )(
        'does not throw an error %s',
        (
          title: string,
          configuration: TestConfiguration,
          errorMessage: string
        ) => {
          expect(() => {
            new PoolTime({ configuration });
          }).not.toThrow(errorMessage);
        }
      );

      it('does not invoke the passed onAccuracyEntryValidation callback', () => {
        const validator = jest.fn();
        const accuracies = [
          {
            upTo: ONE_MINUTE,
            within: {
              key: ONE_SECOND.key,
              value: ONE_SECOND.value,
            } as ReactLikeTimeObject,
          },
          {
            upTo: ETERNITY,
            within: FIVE_REACT_LIKE_SECONDS,
          },
        ];

        new PoolTime<ReactLikeTimeObject>({
          configuration: {
            accuracies,
          },
          onAccuracyEntryValidation: validator,
        });

        expect(validator).not.toHaveBeenCalled();
      });
    });
  });
});
