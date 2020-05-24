import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import useRelativeTime from '../useRelativeTime';
import createPoolTimeProvider, {
  Configuration,
  PoolTimeProviderProps,
  AccuracyEntry,
} from '../createPoolTimeProvider';
import {
  TimeObject,
  TimeObjectWithContext,
} from '../utilities/generateTimeObject';
import {
  ONE_SECOND,
  ETERNITY,
  TEN_SECONDS,
  FIVE_SECONDS,
  ONE_MINUTE,
} from '../timeObjects';

jest.useFakeTimers();

describe('useRelativeTime()', () => {
  const realDateNow = Date.now;
  const startTime = 1000;

  beforeEach(() => {
    Date.now = jest.fn(() => startTime);
  });

  afterEach(() => {
    Date.now = realDateNow;
  });

  const incrementTime = (
    timeInput: TimeObject | TimeObject[] | number | number[]
  ): number => {
    const incrementIndividualTime = (
      timeObject: TimeObject | number
    ): number => {
      const previousTime = Date.now();
      const timeValue =
        typeof timeObject === 'number' ? timeObject : timeObject.value;
      const nextTime = previousTime + timeValue;
      (Date.now as jest.Mock).mockImplementation(() => nextTime);

      act(() => {
        jest.advanceTimersByTime(timeValue);
      });

      return nextTime;
    };

    const incrementMultipleTimes = (times: TimeObject[] | number[]): number => {
      let nextTime = Date.now();

      times.forEach((time: TimeObject | number) => {
        nextTime = incrementIndividualTime(time);
      });

      return nextTime;
    };

    if (Array.isArray(timeInput)) {
      return incrementMultipleTimes(timeInput);
    }

    return incrementIndividualTime(timeInput);
  };

  const generateProviderTestWrapper = (
    PoolTimeProvider: React.FC,
    props: Omit<PoolTimeProviderProps, 'children'> = {}
  ): React.ComponentType => {
    const TestProviderWrapper = React.memo(
      ({ children }: PoolTimeProviderProps) => (
        <PoolTimeProvider {...props}>{children}</PoolTimeProvider>
      )
    );

    TestProviderWrapper.displayName = 'TestProviderWrapper';

    return TestProviderWrapper;
  };

  describe('configuration validation', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    interface InvalidConfigurationScenario {
      readonly configuration: Configuration;
      readonly errorMessage: string;
      readonly title: string;
    }

    const invalidConfigurationScenarios: InvalidConfigurationScenario[] = [
      {
        configuration: {} as Configuration,
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not present.',
        title: 'when provided a configuration object without accuracies',
      },
      {
        configuration: { accuracies: {} } as Configuration,
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
        configuration: { accuracies: [{} as AccuracyEntry] },
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
            } as AccuracyEntry,
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
              upTo: ETERNITY,
              within: {
                key: 'BAD_TIME_OBJECT_MISSING_A_CONTEXT',
                value: 1000,
              },
            } as AccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, key, and value, but instead received: {"key":"BAD_TIME_OBJECT_MISSING_A_CONTEXT","value":1000}.',
        title: 'when provided an time object that does not have a context',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ETERNITY,
              within: {
                context: ONE_SECOND.context,
                value: 1000,
              } as TimeObjectWithContext,
            } as AccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, key, and value, but instead received: {"context":"[object Object]","value":1000}.',
        title:
          'when provided an accuracy entry that does not have exactly the correct keys',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ETERNITY,
              within: {
                context: ONE_SECOND.context,
                key: 'BAD_TIME_OBJECT_MISSING_A_VALUE',
              } as TimeObjectWithContext,
            } as AccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, key, and value, but instead received: {"context":"[object Object]","key":"BAD_TIME_OBJECT_MISSING_A_VALUE"}.',
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

    describe('when not in production', () => {
      it('does not throw an error when valid configurations are provided', () => {
        expect(() => {
          createPoolTimeProvider({
            accuracies: [
              {
                upTo: ETERNITY,
                within: ONE_SECOND,
              },
            ],
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
        'throws the expected error %s',
        (title: string, configuration: Configuration, errorMessage: string) => {
          expect(() => {
            createPoolTimeProvider(configuration);
          }).toThrow(errorMessage);
        }
      );
    });

    describe('when in production', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('does not throw an error when valid configurations are provided', () => {
        expect(() => {
          createPoolTimeProvider({
            accuracies: [
              {
                upTo: ETERNITY,
                within: ONE_SECOND,
              },
            ],
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
        (title: string, configuration: Configuration) => {
          expect(() => {
            createPoolTimeProvider(configuration);
          }).not.toThrow();
        }
      );
    });
  });

  describe('when there is a single hook rendered', () => {
    describe('when given the simplest possible configuration', () => {
      const simpleConfiguration = {
        accuracies: [
          {
            upTo: ETERNITY,
            within: ONE_SECOND,
          },
        ],
      };

      it.each([
        ['past', -1],
        ['present', 0],
        ['future', 1],
      ])(
        'returns the correct initial result when the target time is in the %s',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            difference: 0 - difference,
            time: startTime,
          });
        }
      );

      it('returns the previous result up until the next tick occurs', () => {
        const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        });

        const initialResult = result.current;

        incrementTime(1);

        expect(result.current).toBe(initialResult);

        incrementTime(998);

        expect(result.current).toBe(initialResult);
      });

      it('returns the correct result after one tick', () => {
        const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        });

        const nextTime = incrementTime(ONE_SECOND);

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          time: nextTime,
        });
      });

      it('returns the correct result after multiple ticks', () => {
        const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        });

        const nextTime = incrementTime([ONE_SECOND, ONE_SECOND]);

        expect(result.current).toEqual({
          difference: ONE_SECOND.value * 2,
          time: nextTime,
        });
      });

      describe('event handlers', () => {
        it('invokes onIntervalChange with the correct value', () => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const handleIntervalChange = jest.fn();

          renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onIntervalChange: handleIntervalChange,
            }),
          });

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            ONE_SECOND.value
          );
        });

        it('invokes onRegister with the correct value', () => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const handleRegister = jest.fn();

          renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onRegister: handleRegister,
            }),
          });

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });

        it('invokes onUnregister with the correct value', () => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const handleUnregister = jest.fn();

          const { unmount } = renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onUnregister: handleUnregister,
            }),
          });

          expect(handleUnregister).not.toHaveBeenCalled();

          unmount();

          expect(handleUnregister).toHaveBeenCalledTimes(1);
          expect(handleUnregister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });
      });
    });

    describe('when given a standard configuration', () => {
      const standardConfiguration = {
        accuracies: [
          {
            upTo: TEN_SECONDS,
            within: ONE_SECOND,
          },
          {
            upTo: ETERNITY,
            within: FIVE_SECONDS,
          },
        ],
      };

      it.each([
        ['past', -1],
        ['present', 0],
        ['future', 1],
      ])(
        'returns the correct initial result when the target time is in the %s',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            difference: 0 - difference,
            time: startTime,
          });
        }
      );

      it('returns the previous result up until the next tick occurs', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        });

        const initialResult = result.current;

        incrementTime(1);

        expect(result.current).toBe(initialResult);

        incrementTime(998);

        expect(result.current).toBe(initialResult);
      });

      it('returns the correct result after one tick', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        });

        const nextTime = incrementTime(ONE_SECOND);

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          time: nextTime,
        });
      });

      it('does not move up to the next accuracy while still within scope of the current accuracy', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const handleIntervalChange = jest.fn();
        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider, {
            onIntervalChange: handleIntervalChange,
          }),
        });

        expect(handleIntervalChange).toHaveBeenCalledTimes(1);
        expect(handleIntervalChange).toHaveBeenLastCalledWith(ONE_SECOND.value);

        incrementTime(Array(9).fill(ONE_SECOND));

        const resultAtNineSeconds = result.current;
        expect(resultAtNineSeconds).toEqual({
          difference: TEN_SECONDS.value - ONE_SECOND.value,
          time: startTime + TEN_SECONDS.value - ONE_SECOND.value,
        });
        expect(handleIntervalChange).toHaveBeenCalledTimes(1);

        incrementTime(ONE_SECOND.value - 1);
        expect(result.current).toBe(resultAtNineSeconds);
        expect(handleIntervalChange).toHaveBeenCalledTimes(1);
      });

      it('moves the interval up to the next accuracy when it should', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const handleIntervalChange = jest.fn();
        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider, {
            onIntervalChange: handleIntervalChange,
          }),
        });

        expect(handleIntervalChange).toHaveBeenCalledTimes(1);
        expect(handleIntervalChange).toHaveBeenLastCalledWith(ONE_SECOND.value);

        incrementTime(Array(10).fill(ONE_SECOND));

        expect(result.current).toEqual({
          difference: TEN_SECONDS.value,
          time: startTime + TEN_SECONDS.value,
        });
        expect(handleIntervalChange).toHaveBeenCalledTimes(2);
        expect(handleIntervalChange).toHaveBeenLastCalledWith(
          FIVE_SECONDS.value
        );
      });
    });
  });
});
