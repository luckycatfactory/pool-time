import PoolTime, {
  BaseTimeObject,
  CoreAccuracyEntry,
  CoreConfiguration,
  TimeState,
  ETERNITY,
} from '../index';

jest.useFakeTimers();

describe('PoolTime', () => {
  const originalNow = Date.now;
  const mockInitializationTime = 1000;

  beforeEach(() => {
    Date.now = jest.fn(() => mockInitializationTime);
  });

  afterEach(() => {
    Date.now = originalNow;
  });

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

  const configuration = {
    accuracies: [
      {
        upTo: ONE_MINUTE,
        within: ONE_SECOND,
      },
      {
        upTo: ETERNITY,
        within: FIVE_SECONDS,
      },
    ],
  };

  const threeLayerConfiguration = {
    accuracies: [
      {
        upTo: ONE_SECOND,
        within: ONE_SECOND,
      },
      {
        upTo: ONE_MINUTE,
        within: FIVE_SECONDS,
      },
      {
        upTo: ETERNITY,
        within: TEN_SECONDS,
      },
    ],
  };

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

  describe('#getTimes', () => {
    it('returns the correct default times', () => {
      const poolTime = new PoolTime({ configuration });

      expect(poolTime.getTimes()).toEqual({
        [ONE_SECOND.key]: {
          key: ONE_SECOND.key,
          time: mockInitializationTime,
          value: ONE_SECOND.value,
        },
        [FIVE_SECONDS.key]: {
          key: FIVE_SECONDS.key,
          time: mockInitializationTime,
          value: FIVE_SECONDS.value,
        },
      });
    });
  });

  describe('registration behavior', () => {
    describe('when a registration occurs', () => {
      it('emits to least common duration change handlers when there is a change and there is one handler', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        expect(mockHandleLeastCommonDurationChange).toHaveBeenLastCalledWith({
          upTo: ONE_MINUTE,
          within: ONE_SECOND,
        });
      });

      it('emits to least common duration change handlers when there is a change and there are several handlers', () => {
        const poolTime = new PoolTime({ configuration });
        const firstMockHandleLeastCommonDurationChange = jest.fn();
        const secondMockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          firstMockHandleLeastCommonDurationChange
        );
        poolTime.subscribeToLeastCommonDurationChange(
          secondMockHandleLeastCommonDurationChange
        );

        expect(firstMockHandleLeastCommonDurationChange).not.toHaveBeenCalled();
        expect(
          secondMockHandleLeastCommonDurationChange
        ).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);

        expect(firstMockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(
          1
        );
        expect(
          firstMockHandleLeastCommonDurationChange
        ).toHaveBeenLastCalledWith({
          upTo: ONE_MINUTE,
          within: ONE_SECOND,
        });
        expect(secondMockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(
          1
        );
        expect(
          secondMockHandleLeastCommonDurationChange
        ).toHaveBeenLastCalledWith({
          upTo: ONE_MINUTE,
          within: ONE_SECOND,
        });
      });

      it('emits to least common duration change handlers when a new smallest duration is registered', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();

        poolTime.register(FIVE_SECONDS.key);

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        expect(mockHandleLeastCommonDurationChange).toHaveBeenLastCalledWith({
          upTo: ETERNITY,
          within: FIVE_SECONDS,
        });
        mockHandleLeastCommonDurationChange.mockClear();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        expect(mockHandleLeastCommonDurationChange).toHaveBeenLastCalledWith({
          upTo: ONE_MINUTE,
          within: ONE_SECOND,
        });
      });

      it('does not emit to any least common duration change handlers when there is no change', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        mockHandleLeastCommonDurationChange.mockClear();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();
      });

      it('properly removes least common duration change handlers when unsubscribed', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        const unsubscribe = poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();
        unsubscribe();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();
      });

      it('properly emits to tick handlers when the least common duration changes', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleTick = jest.fn();
        poolTime.subscribeToTick(mockHandleTick);

        expect(mockHandleTick).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1000,
          },
        });
      });

      it('properly emits to tick handlers when the least common duration changes and there are multiple handlers', () => {
        const poolTime = new PoolTime({ configuration });
        const firstMockHandleTick = jest.fn();
        const secondMockHandleTick = jest.fn();
        poolTime.subscribeToTick(firstMockHandleTick);
        poolTime.subscribeToTick(secondMockHandleTick);

        expect(firstMockHandleTick).not.toHaveBeenCalled();
        expect(secondMockHandleTick).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);

        expect(firstMockHandleTick).toHaveBeenCalledTimes(1);
        expect(firstMockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1000,
          },
        });
        expect(secondMockHandleTick).toHaveBeenCalledTimes(1);
        expect(secondMockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1000,
          },
        });
      });

      it('properly emits to tick handlers when the least common duration changes to a shorter duration', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleTick = jest.fn();
        poolTime.subscribeToTick(mockHandleTick);

        expect(mockHandleTick).not.toHaveBeenCalled();

        poolTime.register(FIVE_SECONDS.key);

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1000,
          },
        });

        (Date.now as jest.Mock).mockImplementation(() => 1500);

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleTick).toHaveBeenCalledTimes(2);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1500,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1000,
          },
        });
      });

      it('does not emit to tick handlers when the least common duration does not change', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleTick = jest.fn();
        poolTime.subscribeToTick(mockHandleTick);

        expect(mockHandleTick).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        mockHandleTick.mockClear();

        poolTime.register(ONE_SECOND.key);

        expect(mockHandleTick).not.toHaveBeenCalled();
      });

      it('properly removes tick handlers when unsubscribed', () => {
        const poolTime = new PoolTime({ configuration });
        const firstMockHandleTick = jest.fn();
        const secondMockHandleTick = jest.fn();
        const firstUnsubscribe = poolTime.subscribeToTick(firstMockHandleTick);
        const secondUnsubscribe = poolTime.subscribeToTick(
          secondMockHandleTick
        );

        expect(firstMockHandleTick).not.toHaveBeenCalled();
        expect(secondMockHandleTick).not.toHaveBeenCalled();
        firstUnsubscribe();
        secondUnsubscribe();

        poolTime.register(ONE_SECOND.key);

        expect(firstMockHandleTick).not.toHaveBeenCalled();
        expect(secondMockHandleTick).not.toHaveBeenCalled();
      });
    });

    describe('when an unregistration occurs', () => {
      it('emits to least common duration change handlers when there is a change and there is one handler', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();

        const unregister = poolTime.register(ONE_SECOND.key);

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        mockHandleLeastCommonDurationChange.mockClear();

        unregister();

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        expect(mockHandleLeastCommonDurationChange).toHaveBeenLastCalledWith(
          null
        );
      });

      it('emits to least common duration change handlers when there is a change and there is one handler', () => {
        const poolTime = new PoolTime({ configuration });
        const firstMockHandleLeastCommonDurationChange = jest.fn();
        const secondMockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          firstMockHandleLeastCommonDurationChange
        );
        poolTime.subscribeToLeastCommonDurationChange(
          secondMockHandleLeastCommonDurationChange
        );

        expect(firstMockHandleLeastCommonDurationChange).not.toHaveBeenCalled();
        expect(
          secondMockHandleLeastCommonDurationChange
        ).not.toHaveBeenCalled();

        const unregister = poolTime.register(ONE_SECOND.key);

        expect(firstMockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(
          1
        );
        firstMockHandleLeastCommonDurationChange.mockClear();
        expect(secondMockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(
          1
        );
        secondMockHandleLeastCommonDurationChange.mockClear();

        unregister();

        expect(firstMockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(
          1
        );
        expect(
          firstMockHandleLeastCommonDurationChange
        ).toHaveBeenLastCalledWith(null);
        expect(secondMockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(
          1
        );
        expect(
          secondMockHandleLeastCommonDurationChange
        ).toHaveBeenLastCalledWith(null);
      });

      it('emits to least common duration change handlers when the previous smallest duration is completely unregistered', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();

        poolTime.register(FIVE_SECONDS.key);
        const unregisterOneSecond = poolTime.register(ONE_SECOND.key);
        mockHandleLeastCommonDurationChange.mockClear();

        unregisterOneSecond();

        expect(mockHandleLeastCommonDurationChange).toHaveBeenCalledTimes(1);
        expect(mockHandleLeastCommonDurationChange).toHaveBeenLastCalledWith({
          upTo: ETERNITY,
          within: FIVE_SECONDS,
        });
      });

      it('does not emit to any least common duration change handlers when there is no change', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleLeastCommonDurationChange = jest.fn();
        poolTime.subscribeToLeastCommonDurationChange(
          mockHandleLeastCommonDurationChange
        );

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);
        const unregister = poolTime.register(ONE_SECOND.key);
        mockHandleLeastCommonDurationChange.mockClear();

        unregister();

        expect(mockHandleLeastCommonDurationChange).not.toHaveBeenCalled();
      });

      it('properly emits to tick handlers when the least common duration changes', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleTick = jest.fn();
        poolTime.subscribeToTick(mockHandleTick);

        expect(mockHandleTick).not.toHaveBeenCalled();

        const unregisterOneSecond = poolTime.register(ONE_SECOND.key);
        poolTime.register(FIVE_SECONDS.key);
        mockHandleTick.mockClear();

        (Date.now as jest.Mock).mockImplementation(() => 1500);

        unregisterOneSecond();

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1500,
          },
        });
      });

      it('properly emits to tick handlers when the least common duration changes and there are multiple handlers', () => {
        const poolTime = new PoolTime({ configuration });
        const firstMockHandleTick = jest.fn();
        const secondMockHandleTick = jest.fn();
        poolTime.subscribeToTick(firstMockHandleTick);
        poolTime.subscribeToTick(secondMockHandleTick);

        expect(firstMockHandleTick).not.toHaveBeenCalled();
        expect(secondMockHandleTick).not.toHaveBeenCalled();

        const unregisterOneSecond = poolTime.register(ONE_SECOND.key);
        poolTime.register(FIVE_SECONDS.key);
        firstMockHandleTick.mockClear();
        secondMockHandleTick.mockClear();

        (Date.now as jest.Mock).mockImplementation(() => 1500);

        unregisterOneSecond();

        expect(firstMockHandleTick).toHaveBeenCalledTimes(1);
        expect(firstMockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1500,
          },
        });
        expect(secondMockHandleTick).toHaveBeenCalledTimes(1);
        expect(secondMockHandleTick).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: {
            ...ONE_SECOND,
            time: 1000,
          },
          [FIVE_SECONDS.key]: {
            ...FIVE_SECONDS,
            time: 1500,
          },
        });
      });

      it('does not emit to tick handlers when the least common duration does not change', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleTick = jest.fn();
        poolTime.subscribeToTick(mockHandleTick);

        expect(mockHandleTick).not.toHaveBeenCalled();

        const firstUnregister = poolTime.register(ONE_SECOND.key);
        const secondUnregister = poolTime.register(ONE_SECOND.key);
        mockHandleTick.mockClear();

        firstUnregister();
        secondUnregister();

        expect(mockHandleTick).not.toHaveBeenCalled();
      });

      it('does emit to tick handlers when there is still a least common duration', () => {
        const poolTime = new PoolTime({ configuration });
        const mockHandleTick = jest.fn();
        poolTime.subscribeToTick(mockHandleTick);

        expect(mockHandleTick).not.toHaveBeenCalled();

        poolTime.register(ONE_SECOND.key);
        const unregister = poolTime.register(FIVE_SECONDS.key);
        mockHandleTick.mockClear();

        unregister();

        expect(mockHandleTick).not.toHaveBeenCalled();
      });
    });
  });

  describe('#startTicking', () => {
    const advanceTimeBy = (timeInMilliseconds: number, repeat = 1): void => {
      const initialTime = Date.now();
      for (let i = 0; i < repeat; i++) {
        const nextTime = initialTime + timeInMilliseconds * (i + 1);
        (Date.now as jest.Mock).mockImplementation(() => nextTime);
        jest.advanceTimersByTime(timeInMilliseconds);
      }
    };

    const generatePoolTimeWithOneRegistrationEach = (): {
      initialTimes: TimeState<{}>;
      mockHandleTick: jest.Mock;
      poolTime: PoolTime<{}>;
    } => {
      const mockHandleTick = jest.fn();
      const poolTime = new PoolTime({
        configuration: threeLayerConfiguration,
      });
      poolTime.subscribeToTick(mockHandleTick);
      poolTime.register(ONE_SECOND.key);
      poolTime.register(FIVE_SECONDS.key);
      poolTime.register(TEN_SECONDS.key);
      // None of these tests will concern themselves with the least common
      // duration handling, so let's just clear the mock.
      mockHandleTick.mockClear();

      const initialTimes = poolTime.getTimes();

      return { initialTimes, mockHandleTick, poolTime };
    };

    describe('when it should not start an interval', () => {
      it.each([['test'], ['development']])(
        'throws the correct error if called before registrations are in when in %s',
        (targetEnvironment) => {
          process.env.NODE_ENV = targetEnvironment;
          const poolTime = new PoolTime({ configuration });

          expect(() => {
            poolTime.startTicking();
          }).toThrow(
            "The pool-time instance can not be started when there are no registrations. This is likely an issue with the implementation of pool-time that you're using."
          );
        }
      );

      it('fails gracefully in if called before registrations are in for production', () => {
        process.env.NODE_ENV = 'production';
        const poolTime = new PoolTime({ configuration });

        let stopTicking: () => void;

        expect(() => {
          stopTicking = poolTime.startTicking();
        }).not.toThrow();

        expect(() => {
          stopTicking();
        }).not.toThrow();
      });
    });

    describe('when it should start an interval', () => {
      it('does not immediately emit a tick', () => {
        const {
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        poolTime.startTicking();

        expect(mockHandleTick).not.toHaveBeenCalled();

        advanceTimeBy(999);

        expect(mockHandleTick).not.toHaveBeenCalled();
      });

      it('properly emits a single tick when only the shortest duration should be updated', () => {
        const {
          initialTimes,
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        poolTime.startTicking();

        expect(mockHandleTick).not.toHaveBeenCalled();

        advanceTimeBy(1000);

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          ...initialTimes,
          [ONE_SECOND.key]: {
            ...initialTimes[ONE_SECOND.key],
            time: mockInitializationTime + 1000,
          },
        });
      });

      it('properly emits a several ticks when only the shortest duration should be updated', () => {
        const {
          initialTimes,
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        poolTime.startTicking();

        expect(mockHandleTick).not.toHaveBeenCalled();

        advanceTimeBy(1000, 4);

        expect(mockHandleTick).toHaveBeenCalledTimes(4);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          ...initialTimes,
          [ONE_SECOND.key]: {
            ...initialTimes[ONE_SECOND.key],
            time: mockInitializationTime + 4000,
          },
        });
      });

      it('properly emits a tick with the correct times when another time needs to be updated', () => {
        const {
          initialTimes,
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        poolTime.startTicking();

        expect(mockHandleTick).not.toHaveBeenCalled();

        advanceTimeBy(4000);

        mockHandleTick.mockClear();

        advanceTimeBy(1000);

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          ...initialTimes,
          [ONE_SECOND.key]: {
            ...initialTimes[ONE_SECOND.key],
            time: mockInitializationTime + 5000,
          },
          [FIVE_SECONDS.key]: {
            ...initialTimes[FIVE_SECONDS.key],
            time: mockInitializationTime + 5000,
          },
        });
      });

      it('properly emits a tick with the correct times when multiple other times need to be updated', () => {
        const {
          initialTimes,
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        poolTime.startTicking();

        expect(mockHandleTick).not.toHaveBeenCalled();

        advanceTimeBy(1000, 9);

        mockHandleTick.mockClear();

        advanceTimeBy(1000);

        expect(mockHandleTick).toHaveBeenCalledTimes(1);
        expect(mockHandleTick).toHaveBeenLastCalledWith({
          ...initialTimes,
          [ONE_SECOND.key]: {
            ...initialTimes[ONE_SECOND.key],
            time: mockInitializationTime + 10000,
          },
          [FIVE_SECONDS.key]: {
            ...initialTimes[FIVE_SECONDS.key],
            time: mockInitializationTime + 10000,
          },
          [TEN_SECONDS.key]: {
            ...initialTimes[TEN_SECONDS.key],
            time: mockInitializationTime + 10000,
          },
        });
      });
    });

    describe('when it should stop an interval', () => {
      it('does not immediately emit a tick', () => {
        const {
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        const stopTicking = poolTime.startTicking();

        stopTicking();

        expect(mockHandleTick).not.toHaveBeenCalled();
      });

      it('ceases all future tick emits', () => {
        const {
          mockHandleTick,
          poolTime,
        } = generatePoolTimeWithOneRegistrationEach();

        const stopTicking = poolTime.startTicking();

        stopTicking();

        advanceTimeBy(1000, 10);

        expect(mockHandleTick).not.toHaveBeenCalled();
      });
    });
  });
});
