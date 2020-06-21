import React, { useRef } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import useRelativeTime, {
  UseRelativeTimeResponse,
  RoundingStrategy,
} from '../useRelativeTime';
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
  FIFTEEN_SECONDS,
  THIRTY_SECONDS,
  ONE_MINUTE,
  SIX_HOURS,
  FIVE_MINUTES,
} from '../timeObjects';

jest.useFakeTimers();

describe('useRelativeTime()', () => {
  const realDateNow = Date.now;
  const startTime = SIX_HOURS.value;

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

  const simpleConfiguration = {
    accuracies: [
      {
        upTo: ETERNITY,
        within: ONE_SECOND,
      },
    ],
  };

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
              upTo: {
                key: 'BAD_TIME_OBJECT_MISSING_A_CONTEXT',
                value: 1000,
              },
              within: ONE_SECOND,
            } as AccuracyEntry,
            {
              upTo: ETERNITY,
              within: FIVE_MINUTES,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, but instead received: {"key":"BAD_TIME_OBJECT_MISSING_A_CONTEXT","value":1000}.',
        title: 'when provided an time object that does not have a context',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: {
                value: 1000,
              } as TimeObjectWithContext,
              within: ONE_SECOND,
            } as AccuracyEntry,
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
              upTo: {
                context: ONE_MINUTE.context,
                key: 'BAD_TIME_OBJECT_MISSING_A_VALUE',
              } as TimeObjectWithContext,
              within: ONE_SECOND,
            } as AccuracyEntry,
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a key and value, but instead received: {"context":"[object Object]","key":"BAD_TIME_OBJECT_MISSING_A_VALUE"}.',
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
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, but instead received: {"key":"BAD_TIME_OBJECT_MISSING_A_CONTEXT","value":1000}.',
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
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a key and value, but instead received: {"context":"[object Object]","value":1000}.',
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
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a key and value, but instead received: {"context":"[object Object]","key":"BAD_TIME_OBJECT_MISSING_A_VALUE"}.',
        title:
          'when provided an accuracy entry that does not have exactly the correct keys',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: ETERNITY,
              within: {
                key: ONE_SECOND.key,
                value: ONE_SECOND.value,
              } as TimeObjectWithContext,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, but instead received: {"key":"ONE_SECOND","value":1000}.',
        title: 'when not provided a context for a within time object',
      },
      {
        configuration: {
          accuracies: [
            {
              upTo: {
                key: ONE_MINUTE.key,
                value: ONE_MINUTE.value,
              } as TimeObjectWithContext,
              within: ONE_SECOND,
            },
            {
              upTo: ETERNITY,
              within: FIVE_SECONDS,
            },
          ],
        },
        errorMessage:
          'Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, but instead received: {"key":"ONE_MINUTE","value":60000}.',
        title: 'when not provided a context for a within time object',
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
        (title: string, configuration: Configuration, errorMessage: string) => {
          expect(() => {
            createPoolTimeProvider(configuration);
          }).not.toThrow(errorMessage);
        }
      );
    });
  });

  describe('when there is a single hook rendered', () => {
    describe('when given the simplest possible configuration', () => {
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
            getRoundedDifference: expect.any(Function),
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
          getRoundedDifference: expect.any(Function),
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
          getRoundedDifference: expect.any(Function),
          time: nextTime,
        });
      });

      it('returns the correct result when moving from the future to the present to the past', () => {
        const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

        const { result } = renderHook(
          () => useRelativeTime(startTime + ONE_SECOND.value),
          {
            wrapper: generateProviderTestWrapper(PoolTimeProvider),
          }
        );

        expect(result.current).toEqual({
          difference: 0 - ONE_SECOND.value,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        });

        const secondTime = incrementTime(ONE_SECOND);

        expect(result.current).toEqual({
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: secondTime,
        });

        const thirdTime = incrementTime(ONE_SECOND);

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          getRoundedDifference: expect.any(Function),
          time: thirdTime,
        });
      });

      it('returns the correct value when the hook is skipped, then time moves forward but not to the next tick, then the hook is no longer skipped', () => {
        const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

        const { result, rerender } = renderHook(
          ({ skip }) => useRelativeTime(startTime - ONE_SECOND.value, { skip }),
          {
            initialProps: { skip: true },
            wrapper: generateProviderTestWrapper(PoolTimeProvider),
          }
        );

        const initialResult = result.current;
        expect(initialResult).toEqual({
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        });

        incrementTime(1);

        expect(result.current).toBe(initialResult);

        incrementTime(498);
        rerender({ skip: false });

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          getRoundedDifference: expect.any(Function),
          time: startTime,
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

        it('invokes onRegister with the correct value on initialization', () => {
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

        it('invokes onUnregister with the correct value on unmount', () => {
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

        it('does not invoke onRegister or onIntervalChange when the hook is called with skip set to true', () => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const handleIntervalChange = jest.fn();
          const handleRegister = jest.fn();

          renderHook(() => useRelativeTime(startTime, { skip: true }), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onIntervalChange: handleIntervalChange,
              onRegister: handleRegister,
            }),
          });

          expect(handleIntervalChange).not.toHaveBeenCalled();
          expect(handleRegister).not.toHaveBeenCalled();
        });

        it('invokes onRegister and onIntervalChange when the hook is initially called with skip set to true but then is called with skip set to false', () => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const handleIntervalChange = jest.fn();
          const handleRegister = jest.fn();

          const { rerender } = renderHook(
            ({ skip }) => useRelativeTime(startTime, { skip }),
            {
              initialProps: { skip: true },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
                onRegister: handleRegister,
              }),
            }
          );

          expect(handleIntervalChange).not.toHaveBeenCalled();
          expect(handleRegister).not.toHaveBeenCalled();

          rerender({ skip: false });

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            ONE_SECOND.value
          );
          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });

        it('invokes onUnregister and onIntervalChange when the hook is initially called with skip set to false but then is called with skip set to true', () => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);

          const handleIntervalChange = jest.fn();
          const handleUnregister = jest.fn();

          const { rerender } = renderHook(
            ({ skip }) => useRelativeTime(startTime, { skip }),
            {
              initialProps: { skip: false },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
                onUnregister: handleUnregister,
              }),
            }
          );

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleUnregister).not.toHaveBeenCalled();

          rerender({ skip: true });

          expect(handleIntervalChange).toHaveBeenCalledTimes(2);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(null);
          expect(handleUnregister).toHaveBeenCalledTimes(1);
          expect(handleUnregister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });
      });
    });

    describe('when given a standard configuration', () => {
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
            getRoundedDifference: expect.any(Function),
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
          getRoundedDifference: expect.any(Function),
          time: nextTime,
        });
      });

      it('returns the correct result when moving from the future to the present to the past', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const { result } = renderHook(
          () => useRelativeTime(startTime + ONE_SECOND.value),
          {
            wrapper: generateProviderTestWrapper(PoolTimeProvider),
          }
        );

        expect(result.current).toEqual({
          difference: 0 - ONE_SECOND.value,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        });

        const secondTime = incrementTime(ONE_SECOND);

        expect(result.current).toEqual({
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: secondTime,
        });

        const thirdTime = incrementTime(ONE_SECOND);

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          getRoundedDifference: expect.any(Function),
          time: thirdTime,
        });
      });

      it('returns the correct results when moving over an interval/accuracy bound in the future', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const { result } = renderHook(
          () =>
            useRelativeTime(startTime + TEN_SECONDS.value + FIVE_SECONDS.value),
          {
            wrapper: generateProviderTestWrapper(PoolTimeProvider),
          }
        );

        const initialResult = result.current;
        expect(result.current).toEqual({
          difference: 0 - TEN_SECONDS.value - FIVE_SECONDS.value,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        });

        incrementTime(ONE_SECOND);

        expect(result.current).toBe(initialResult);

        // One millisecond before it should move over.
        incrementTime(ONE_SECOND.value * 4 - 1);

        expect(result.current).toBe(initialResult);

        const thirdTime = incrementTime(1);

        expect(result.current).toEqual({
          difference: 0 - TEN_SECONDS.value,
          getRoundedDifference: expect.any(Function),
          time: thirdTime,
        });
      });

      it('returns the correct value when the hook is skipped, then time moves forward but not to the next tick, then the hook is no longer skipped', () => {
        const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

        const { result, rerender } = renderHook(
          ({ skip }) => useRelativeTime(startTime - ONE_SECOND.value, { skip }),
          {
            initialProps: { skip: true },
            wrapper: generateProviderTestWrapper(PoolTimeProvider),
          }
        );

        const initialResult = result.current;
        expect(initialResult).toEqual({
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        });

        incrementTime(1);

        expect(result.current).toBe(initialResult);

        incrementTime(498);
        rerender({ skip: false });

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          getRoundedDifference: expect.any(Function),
          time: startTime,
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
          getRoundedDifference: expect.any(Function),
          time: startTime + TEN_SECONDS.value - ONE_SECOND.value,
        });
        expect(handleIntervalChange).toHaveBeenCalledTimes(1);

        incrementTime(ONE_SECOND.value - 1);
        expect(result.current).toBe(resultAtNineSeconds);
        expect(handleIntervalChange).toHaveBeenCalledTimes(1);
      });

      describe('event handlers', () => {
        it('invokes onIntervalChange with the correct value', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

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

        it('moves the interval up to the next accuracy when it should', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();
          const { result } = renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onIntervalChange: handleIntervalChange,
            }),
          });

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            ONE_SECOND.value
          );

          incrementTime(Array(10).fill(ONE_SECOND));

          expect(result.current).toEqual({
            difference: TEN_SECONDS.value,
            getRoundedDifference: expect.any(Function),
            time: startTime + TEN_SECONDS.value,
          });
          expect(handleIntervalChange).toHaveBeenCalledTimes(2);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            FIVE_SECONDS.value
          );
        });

        it('invokes onRegister with the correct value on initialization', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleRegister = jest.fn();

          renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onRegister: handleRegister,
            }),
          });

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });

        it('invokes onUnregister with the correct value on unmount', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

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

        it('invokes onUnregister with the correct value and then onRegister with the correct value when moving to the next interval up', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleRegister = jest.fn();
          const handleUnregister = jest.fn();

          renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onRegister: handleRegister,
              onUnregister: handleUnregister,
            }),
          });

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
          expect(handleUnregister).not.toHaveBeenCalled();

          incrementTime(Array(10).fill(ONE_SECOND));

          expect(handleUnregister).toHaveBeenCalledTimes(1);
          expect(handleUnregister).toHaveBeenLastCalledWith(ONE_SECOND.key);
          expect(handleRegister).toHaveBeenCalledTimes(2);
          expect(handleRegister).toHaveBeenLastCalledWith(FIVE_SECONDS.key);
        });

        it('invokes onUnregister after having moved up to the next interval and then unmounting', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleRegister = jest.fn();
          const handleUnregister = jest.fn();

          renderHook(() => useRelativeTime(startTime), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onRegister: handleRegister,
              onUnregister: handleUnregister,
            }),
          });

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
          expect(handleUnregister).not.toHaveBeenCalled();

          incrementTime(Array(10).fill(ONE_SECOND));

          expect(handleUnregister).toHaveBeenCalledTimes(1);
          expect(handleUnregister).toHaveBeenLastCalledWith(ONE_SECOND.key);
          expect(handleRegister).toHaveBeenCalledTimes(2);
          expect(handleRegister).toHaveBeenLastCalledWith(FIVE_SECONDS.key);
        });

        it('does not invoke onRegister or onIntervalChange when the hook is called with skip set to true', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();
          const handleRegister = jest.fn();

          renderHook(() => useRelativeTime(startTime, { skip: true }), {
            wrapper: generateProviderTestWrapper(PoolTimeProvider, {
              onIntervalChange: handleIntervalChange,
              onRegister: handleRegister,
            }),
          });

          expect(handleIntervalChange).not.toHaveBeenCalled();
          expect(handleRegister).not.toHaveBeenCalled();
        });

        it('invokes onRegister and onIntervalChange when the hook is initially called with skip set to true but then is called with skip set to false', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();
          const handleRegister = jest.fn();

          const { rerender } = renderHook(
            ({ skip }) => useRelativeTime(startTime, { skip }),
            {
              initialProps: { skip: true },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
                onRegister: handleRegister,
              }),
            }
          );

          expect(handleIntervalChange).not.toHaveBeenCalled();
          expect(handleRegister).not.toHaveBeenCalled();

          rerender({ skip: false });

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            ONE_SECOND.value
          );
          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });

        it('invokes onUnregister and onIntervalChange when the hook is initially called with skip set to false but then is called with skip set to true', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();
          const handleUnregister = jest.fn();

          const { rerender } = renderHook(
            ({ skip }) => useRelativeTime(startTime, { skip }),
            {
              initialProps: { skip: false },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
                onUnregister: handleUnregister,
              }),
            }
          );

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleUnregister).not.toHaveBeenCalled();

          rerender({ skip: true });

          expect(handleIntervalChange).toHaveBeenCalledTimes(2);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(null);
          expect(handleUnregister).toHaveBeenCalledTimes(1);
          expect(handleUnregister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });
      });
    });
  });

  describe('when there are multiple hooks rendered', () => {
    type PropsPerHook = [number, { skip?: boolean }];
    type UseRelativeTimesProps = PropsPerHook[];

    const useRelativeTimes = (
      inputs: UseRelativeTimesProps
    ): { [index: number]: UseRelativeTimeResponse } => {
      const numberOfHooks = useRef(inputs.length);

      if (inputs.length !== numberOfHooks.current) {
        throw new Error(
          'If you are seeing this, that means the test tried to dynamically alter the number of hooks rendered. Double check your usage of the inputs prop for useRelativeTimes.'
        );
      }

      const hookResponses = inputs.reduce<{
        [index: number]: UseRelativeTimeResponse;
      }>((acc, props, index) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        acc[index] = useRelativeTime(...props);
        return acc;
      }, {});

      return hookResponses;
    };

    it('returns the correct results for the hooks on initialization when both are the same time', () => {
      const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

      const { result } = renderHook(({ inputs }) => useRelativeTimes(inputs), {
        initialProps: {
          inputs: [
            [startTime, {}],
            [startTime, {}],
          ] as UseRelativeTimesProps,
        },
        wrapper: generateProviderTestWrapper(PoolTimeProvider),
      });

      expect(result.current).toEqual({
        0: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
        1: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
      });
    });

    it('returns the correct results for the hooks on initialization when one is skipped and the other is not', () => {
      const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

      const { result } = renderHook(({ inputs }) => useRelativeTimes(inputs), {
        initialProps: {
          inputs: [
            [startTime, {}],
            [startTime, { skip: true }],
          ] as UseRelativeTimesProps,
        },
        wrapper: generateProviderTestWrapper(PoolTimeProvider),
      });

      expect(result.current).toEqual({
        0: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
        1: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
      });
    });

    it('returns the correct results for the hooks on initialization when both are skipped', () => {
      const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

      const { result } = renderHook(({ inputs }) => useRelativeTimes(inputs), {
        initialProps: {
          inputs: [
            [startTime, { skip: true }],
            [startTime, { skip: true }],
          ] as UseRelativeTimesProps,
        },
        wrapper: generateProviderTestWrapper(PoolTimeProvider),
      });

      expect(result.current).toEqual({
        0: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
        1: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
      });
    });

    it('returns the correct results for the hooks on initialization when both are skipped and neither target times are now', () => {
      const PoolTimeProvider = createPoolTimeProvider(standardConfiguration);

      const { result } = renderHook(({ inputs }) => useRelativeTimes(inputs), {
        initialProps: {
          inputs: [
            [startTime - ONE_SECOND.value, { skip: true }],
            [startTime + ONE_SECOND.value, { skip: true }],
          ] as UseRelativeTimesProps,
        },
        wrapper: generateProviderTestWrapper(PoolTimeProvider),
      });

      expect(result.current).toEqual({
        0: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
        1: {
          difference: 0,
          getRoundedDifference: expect.any(Function),
          time: startTime,
        },
      });
    });

    describe('when adding hooks when there is already an interval in place', () => {
      describe('when the newly added hook requires the same accuracy', () => {
        it('returns the correct results', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const { result, rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime - TEN_SECONDS.value, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            0: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });

          incrementTime(FIVE_SECONDS);

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime - TEN_SECONDS.value, {}],
            ],
          });

          expect(result.current).toEqual({
            0: {
              difference: TEN_SECONDS.value + FIVE_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime + FIVE_SECONDS.value,
            },
            1: {
              difference: TEN_SECONDS.value + FIVE_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime + FIVE_SECONDS.value,
            },
          });
        });

        it('does not change the interval', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();

          const { rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime - TEN_SECONDS.value, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
              }),
            }
          );

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            FIVE_SECONDS.value
          );

          incrementTime(FIVE_SECONDS);

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime - TEN_SECONDS.value, {}],
            ],
          });

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
        });

        it('properly registers the new hook', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleRegister = jest.fn();

          const { rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime - TEN_SECONDS.value, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onRegister: handleRegister,
              }),
            }
          );

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(FIVE_SECONDS.key);

          incrementTime(FIVE_SECONDS);

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime - TEN_SECONDS.value, {}],
            ],
          });

          expect(handleRegister).toHaveBeenCalledTimes(2);
          expect(handleRegister).toHaveBeenLastCalledWith(FIVE_SECONDS.key);
        });
      });

      describe('when the newly added hook requires more accuracy', () => {
        it('returns the correct results', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const { rerender, result } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            0: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime, {}],
            ],
          });

          expect(result.current).toEqual({
            0: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });
        });

        it('properly updates the interval to the more accurate interval', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();

          const { rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
              }),
            }
          );

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            FIVE_SECONDS.value
          );

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime, {}],
            ],
          });

          expect(handleIntervalChange).toHaveBeenCalledTimes(2);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            ONE_SECOND.value
          );
        });

        it('properly updates previous state if it is stale', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const { rerender, result } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          incrementTime(ONE_SECOND);

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime, {}],
            ],
          });

          expect(result.current).toEqual({
            0: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: ONE_SECOND.value,
              getRoundedDifference: expect.any(Function),
              time: startTime + ONE_SECOND.value,
            },
          });
        });

        it('properly registers the new hook', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleRegister = jest.fn();

          const { rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime - TEN_SECONDS.value, {}],
                  [startTime, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onRegister: handleRegister,
              }),
            }
          );

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(FIVE_SECONDS.key);

          incrementTime(FIVE_SECONDS);

          rerender({
            inputs: [
              [startTime - TEN_SECONDS.value, {}],
              [startTime, {}],
            ],
          });

          expect(handleRegister).toHaveBeenCalledTimes(2);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
        });
      });

      describe('when the newly added hook requires less accuracy', () => {
        it('returns the correct results', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const { rerender, result } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime, {}],
                  [startTime - TEN_SECONDS.value, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            0: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });

          rerender({
            inputs: [
              [startTime, {}],
              [startTime - TEN_SECONDS.value, {}],
            ],
          });

          expect(result.current).toEqual({
            0: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });
        });

        it('does not update the interval', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleIntervalChange = jest.fn();

          const { rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime, {}],
                  [startTime - TEN_SECONDS.value, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onIntervalChange: handleIntervalChange,
              }),
            }
          );

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
          expect(handleIntervalChange).toHaveBeenLastCalledWith(
            ONE_SECOND.value
          );

          rerender({
            inputs: [
              [startTime, {}],
              [startTime - TEN_SECONDS.value, {}],
            ],
          });

          expect(handleIntervalChange).toHaveBeenCalledTimes(1);
        });

        it('properly registers the new hook', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const handleRegister = jest.fn();

          const { rerender } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime, {}],
                  [startTime - TEN_SECONDS.value, { skip: true }],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider, {
                onRegister: handleRegister,
              }),
            }
          );

          expect(handleRegister).toHaveBeenCalledTimes(1);
          expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);

          rerender({
            inputs: [
              [startTime, {}],
              [startTime - TEN_SECONDS.value, {}],
            ],
          });

          expect(handleRegister).toHaveBeenCalledTimes(2);
          expect(handleRegister).toHaveBeenLastCalledWith(FIVE_SECONDS.key);
        });

        it('does not perform superfluous updates to less accurate time states', () => {
          const PoolTimeProvider = createPoolTimeProvider(
            standardConfiguration
          );

          const { result } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime, {}],
                  [startTime - TEN_SECONDS.value, {}],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            0: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });
          const initialSecondHookValue = result.current[1];

          incrementTime(ONE_SECOND);

          expect(result.current).toEqual({
            0: {
              difference: ONE_SECOND.value,
              getRoundedDifference: expect.any(Function),
              time: startTime + ONE_SECOND.value,
            },
            1: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });
          expect(result.current[1]).toBe(initialSecondHookValue);
        });

        it('does not perform superfluous updates to less accurate time states when there are more extended accuracies', () => {
          const PoolTimeProvider = createPoolTimeProvider({
            accuracies: [
              {
                upTo: TEN_SECONDS,
                within: ONE_SECOND,
              },
              {
                upTo: THIRTY_SECONDS,
                within: FIVE_SECONDS,
              },
              {
                upTo: ETERNITY,
                within: FIFTEEN_SECONDS,
              },
            ],
          });

          const { result } = renderHook(
            ({ inputs }) => useRelativeTimes(inputs),
            {
              initialProps: {
                inputs: [
                  [startTime, {}],
                  [startTime - TEN_SECONDS.value, {}],
                ] as UseRelativeTimesProps,
              },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            0: {
              difference: 0,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
            1: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });
          const initialSecondHookValue = result.current[1];

          incrementTime(ONE_SECOND);

          expect(result.current).toEqual({
            0: {
              difference: ONE_SECOND.value,
              getRoundedDifference: expect.any(Function),
              time: startTime + ONE_SECOND.value,
            },
            1: {
              difference: TEN_SECONDS.value,
              getRoundedDifference: expect.any(Function),
              time: startTime,
            },
          });
          expect(result.current[1]).toBe(initialSecondHookValue);
        });
      });
    });

    // describe('when removing hooks', () => {});
  });

  describe('when getRoundedDifference is used', () => {
    it('throws the correct error when an invalid rounding strategy is provided', () => {
      const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
      const invalidStrategyString = 'INVALID';
      const { result } = renderHook(
        () =>
          useRelativeTime(startTime, {
            roundingStrategy: invalidStrategyString as RoundingStrategy,
          }),
        {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        }
      );

      expect(() => {
        result.current.getRoundedDifference();
      }).toThrow(
        `Expected roundingStrategy to be one of [ceiling, floor, none, rounded], but received ${invalidStrategyString}.`
      );
    });

    describe('when default rounding behavior (ROUNDED) is used', () => {
      it.each([
        ['in the future', 500],
        ['in the past', -499],
      ])(
        'rounds down when it should when the target time is %s',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(0);
        }
      );

      it.each([
        ['in the future', 501, -1000],
        ['in the past', -500, 1000],
      ])(
        'rounds up when it should when the target time is %s',
        (testKey, difference, expectedDifference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(
            expectedDifference
          );
        }
      );
    });

    describe('when ROUNDED rounding behavior is specified', () => {
      it.each([
        ['in the future', 500],
        ['in the past', -499],
      ])(
        'rounds down when it should when the target time is %s',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(0);
        }
      );

      it.each([
        ['in the future', 501, -1000],
        ['in the past', -500, 1000],
      ])(
        'rounds up when it should when the target time is %s',
        (testKey, difference, expectedDifference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(
            expectedDifference
          );
        }
      );
    });

    describe('when FLOOR rounding behavior is specified', () => {
      it.each([
        ['at the threshold of a range', 0],
        ['at the beginning of a range', 1],
        ['at the end of a range', 999],
      ])(
        'returns the correct value when %s when the target time is in the past',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () =>
              useRelativeTime(startTime - difference, {
                roundingStrategy: RoundingStrategy.FLOOR,
              }),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(0);
        }
      );

      it.each([
        ['at the threshold of a range', 1],
        ['at the beginning of a range', 999],
        ['at the end of a range', 1000],
      ])(
        'returns the correct value when %s when the target time is in the future',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () =>
              useRelativeTime(startTime + difference, {
                roundingStrategy: RoundingStrategy.FLOOR,
              }),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(-1000);
        }
      );
    });

    describe('when CEILING rounding behavior is specified', () => {
      it.each([
        ['at the threshold of a range', 1],
        ['at the beginning of a range', 999],
        ['at the end of a range', 1000],
      ])(
        'returns the correct value when %s when the target time is in the past',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () =>
              useRelativeTime(startTime - difference, {
                roundingStrategy: RoundingStrategy.CEILING,
              }),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(1000);
        }
      );

      it.each([
        ['at the threshold of a range', 0],
        ['at the beginning of a range', 1],
        ['at the end of a range', 999],
      ])(
        'returns the correct value when %s when the target time is in the future',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { result } = renderHook(
            () =>
              useRelativeTime(startTime + difference, {
                roundingStrategy: RoundingStrategy.CEILING,
              }),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );
          expect(result.current.getRoundedDifference()).toBe(0);
        }
      );
    });

    describe('when the rounding strategy is set to NONE', () => {
      const getRandomOffset = (): number =>
        Math.floor(Math.random() * 1000) + 1;

      it('provides the direct value when there is no difference', () => {
        const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
        const { result } = renderHook(
          () =>
            useRelativeTime(startTime, {
              roundingStrategy: RoundingStrategy.NONE,
            }),
          {
            wrapper: generateProviderTestWrapper(PoolTimeProvider),
          }
        );
        expect(result.current.getRoundedDifference()).toBe(0);
      });

      it.each([
        ['in the past', (): number => getRandomOffset()],
        ['in the future', (): number => 0 - getRandomOffset()],
      ])(
        'returns the direct difference without any rounding when %s',
        (testKey, getOffset) => {
          const PoolTimeProvider = createPoolTimeProvider(simpleConfiguration);
          const { rerender, result } = renderHook(
            ({ targetTime }) =>
              useRelativeTime(targetTime, {
                roundingStrategy: RoundingStrategy.NONE,
              }),
            {
              initialProps: { targetTime: startTime },
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          for (let i = 0; i < 25; i++) {
            const offset = getOffset();
            const targetTime = startTime - offset;

            rerender({ targetTime });

            expect(result.current.getRoundedDifference()).toBe(offset);
          }
        }
      );
    });
  });
});
