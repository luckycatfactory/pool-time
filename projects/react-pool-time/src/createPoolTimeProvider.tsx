import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  TimeContextValue,
  TimeObject,
  TimeObjectWithContext,
} from './utilities/generateTimeObject';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';
import { ETERNITY } from './timeObjects';
import roundTimeToSecond from './utilities/roundTimeToSecond';

export interface PoolTimeProviderProps {
  readonly children: React.ReactNode;
  readonly onIntervalChange?: (currentInterval: number) => void;
  readonly onRegister?: (timeKey: string) => void;
  readonly onUnregister?: (timeKey: string) => void;
}

export interface AccuracyEntry {
  readonly upTo: TimeObject;
  readonly within: TimeObjectWithContext;
}

export interface Configuration {
  readonly accuracies: AccuracyEntry[];
}

interface RegistrationState {
  [withinKey: string]: number;
}

interface TimeState {
  context: React.Context<TimeContextValue>;
  time: number;
  value: number;
}

const createPoolTimeProvider = (configuration: Configuration): React.FC => {
  if (process.env.NODE_ENV !== 'production') {
    if (!configuration.accuracies) {
      throw new Error(
        'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not present.'
      );
    }
    if (!Array.isArray(configuration.accuracies)) {
      throw new Error(
        'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not an array.'
      );
    }
    if (configuration.accuracies.length === 0) {
      throw new Error(
        'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was an empty array.'
      );
    }
    const requiredAccuracyEntryKeys = new Set(['upTo', 'within']);
    const invalidAccuracyEntry = configuration.accuracies.find(
      (accuracyEntry) => {
        const keys = Object.keys(accuracyEntry);
        if (
          keys.length !== requiredAccuracyEntryKeys.size ||
          keys.some((key) => !requiredAccuracyEntryKeys.has(key))
        ) {
          return true;
        }
      }
    );
    const stringify = (object: object): string =>
      JSON.stringify(object, (key, value) =>
        key && value && typeof value !== 'number' ? '' + value : value
      );
    if (invalidAccuracyEntry) {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Expected accuracy entry to have keys for "upTo" and "within" with time objects as values, but instead received: ${stringify(
          invalidAccuracyEntry
        )}.`
      );
    }
    const isInvalidTimeObject = (timeObject: TimeObjectWithContext): boolean =>
      timeObject !== ETERNITY &&
      (!timeObject.context || !timeObject.key || !timeObject.value);
    const invalidUpToTimeObject = configuration.accuracies
      .map(({ upTo }) => upTo)
      .find(isInvalidTimeObject);
    const throwInvalidTimeObjectError = (
      invalidTimeObject: TimeObject
    ): void => {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, key, and value, but instead received: ${stringify(
          invalidTimeObject
        )}.`
      );
    };
    if (invalidUpToTimeObject)
      throwInvalidTimeObjectError(invalidUpToTimeObject);
    const invalidWithinTimeObject = configuration.accuracies
      .map(({ within }) => within)
      .find(isInvalidTimeObject);
    if (invalidWithinTimeObject)
      throwInvalidTimeObjectError(invalidWithinTimeObject);

    const upToValues = new Set();
    const duplicateUpToValue = configuration.accuracies.find(({ upTo }) => {
      if (upToValues.has(upTo.key)) return true;

      upToValues.add(upTo.key);

      return false;
    });

    if (duplicateUpToValue) {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Expected all accuracy entries to have unique upTo time values, but found duplicate entry on ${duplicateUpToValue.upTo.key}.`
      );
    }

    const withinValues = new Set();
    const duplicateWithinValue = configuration.accuracies.find(({ within }) => {
      if (withinValues.has(within.key)) return true;

      withinValues.add(within.key);

      return false;
    });

    if (duplicateWithinValue) {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Expected all accuracy entries to have unique within time values, but found duplicate entry on ${duplicateWithinValue.within.key}.`
      );
    }

    const unsortedUpToValueIndex = configuration.accuracies
      .slice(1)
      .findIndex(
        ({ upTo }, index) =>
          configuration.accuracies[index].upTo.value >= upTo.value
      );

    if (unsortedUpToValueIndex !== -1) {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Accuracies must be sorted such that every upTo is greater than the upTo of the previous entry. Found ${
          configuration.accuracies[unsortedUpToValueIndex].upTo.key
        } placed before ${
          configuration.accuracies[unsortedUpToValueIndex + 1].upTo.key
        }.`
      );
    }

    const unsortedWithinValueIndex = configuration.accuracies
      .slice(1)
      .findIndex(
        ({ within }, index) =>
          configuration.accuracies[index].within.value >= within.value
      );

    if (unsortedWithinValueIndex !== -1) {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Accuracies must be sorted such that every within is greater than the within of the previous entry. Found ${
          configuration.accuracies[unsortedWithinValueIndex].within.key
        } placed before ${
          configuration.accuracies[unsortedWithinValueIndex + 1].within.key
        }.`
      );
    }

    const nonsenseAccuracyEntry = configuration.accuracies.find(
      ({ upTo, within }) => upTo.value < within.value
    );

    if (nonsenseAccuracyEntry) {
      throw new Error(
        `Invalid configuration object passed to createPoolTimeProvider. Accuracy entries must always have within values that are less than or equal to their own upTo values. Found an entry with an upTo of ${nonsenseAccuracyEntry.upTo.key} that had a within of ${nonsenseAccuracyEntry.within.key}.`
      );
    }

    if (
      configuration.accuracies[configuration.accuracies.length - 1].upTo !==
      ETERNITY
    ) {
      throw new Error(
        'Invalid configuration object passed to createPoolTimeProvider. Accuracy lists must terminate with an entry with an upTo of ETERNITY.'
      );
    }
  }

  const PoolTimeProvider = React.memo(
    ({
      children,
      onIntervalChange,
      onRegister,
      onUnregister,
    }: PoolTimeProviderProps) => {
      const [registrations, setRegistrations] = useState(() =>
        configuration.accuracies.reduce<RegistrationState>(
          (acc, { within: { key } }) => {
            acc[key] = 0;
            return acc;
          },
          {}
        )
      );
      const [times, setTimes] = useState(() =>
        configuration.accuracies.reduce<{
          [timeKey: string]: TimeState;
        }>((acc, { within }) => {
          acc[within.key] = {
            context: within.context,
            time: Date.now(),
            value: within.value,
          };
          return acc;
        }, {})
      );
      const [slowestTime, setSlowestTime] = useState(undefined);

      const onRegisterRef = useRef<(timeKey: string) => void>(onRegister);
      const onUnregisterRef = useRef<(timeKey: string) => void>(onUnregister);

      useLayoutEffect(() => {
        onRegisterRef.current = onRegister;
      }, [onRegister]);

      useLayoutEffect(() => {
        onUnregisterRef.current = onUnregister;
      }, [onUnregister]);

      const handleRegistration = useCallback((timeKey) => {
        setRegistrations((previousRegistrations) => ({
          ...previousRegistrations,
          [timeKey]: previousRegistrations[timeKey] + 1,
        }));

        onRegisterRef.current && onRegisterRef.current(timeKey);

        return {
          unregister: (): void => {
            setRegistrations((previousRegistrations) => ({
              ...previousRegistrations,
              [timeKey]: previousRegistrations[timeKey] - 1,
            }));

            onUnregisterRef.current && onUnregisterRef.current(timeKey);
          },
        };
      }, []);

      const onIntervalChangeRef = useRef<(currentInterval: number) => void>();

      useLayoutEffect(() => {
        onIntervalChangeRef.current = onIntervalChange;
      }, [onIntervalChange]);

      useLayoutEffect(() => {
        const slowestTime = configuration.accuracies.find((accuracyEntry) =>
          Boolean(registrations[accuracyEntry.within.key])
        );
        setSlowestTime(slowestTime);
      }, [registrations]);

      // Any time the slowest time changes, we need to update the time for that
      // slowest time in order to guarantee that the accuracy specifications
      // hold true.
      useLayoutEffect(() => {
        if (slowestTime) {
          const {
            within: { key },
          } = slowestTime;
          setTimes((previousTimes) => ({
            ...previousTimes,
            [slowestTime.within.key]: {
              ...previousTimes[key],
              time: roundTimeToSecond(Date.now()),
            },
          }));
        }
      }, [slowestTime]);

      const hasPerformedInitialMount = useRef(false);

      useLayoutEffect(() => {
        if (slowestTime) {
          const id = setInterval(() => {
            setTimes((previousTimes) => {
              const nowRoundedToSecond = roundTimeToSecond(Date.now());
              const { nextTimes } = configuration.accuracies.reduce<{
                hasShortCircuited: boolean;
                nextTimes: {
                  [timeKey: string]: TimeState;
                };
              }>(
                (acc, { within: { context, key, value } }) => {
                  if (acc.hasShortCircuited) {
                    acc.nextTimes[key] = previousTimes[key];
                    return acc;
                  }
                  const previousTimeRoundedToSecond = roundTimeToSecond(
                    previousTimes[key].time
                  );
                  const timeSinceLastUpdate =
                    nowRoundedToSecond - previousTimeRoundedToSecond;

                  if (timeSinceLastUpdate >= value) {
                    acc.nextTimes[key] = {
                      context,
                      time: nowRoundedToSecond,
                      value,
                    };
                  } else {
                    acc.nextTimes[key] = previousTimes[key];
                    acc.hasShortCircuited = true;
                  }
                  return acc;
                },
                { hasShortCircuited: false, nextTimes: {} }
              );
              return nextTimes;
            });
          }, slowestTime.within.value);

          onIntervalChangeRef.current &&
            onIntervalChangeRef.current(slowestTime.within.value);

          return (): void => {
            clearInterval(id);
          };
        } else if (!hasPerformedInitialMount.current) {
          hasPerformedInitialMount.current = true;
        } else {
          onIntervalChangeRef.current && onIntervalChangeRef.current(null);
        }
      }, [slowestTime]);

      return (
        <ConfigurationContext.Provider value={configuration}>
          <RegistrationContext.Provider value={handleRegistration}>
            {Object.keys(times).reduce((acc, timeKey) => {
              const timeObject = times[timeKey];

              return (
                <timeObject.context.Provider value={timeObject}>
                  {acc}
                </timeObject.context.Provider>
              );
            }, children)}
          </RegistrationContext.Provider>
        </ConfigurationContext.Provider>
      );
    }
  );

  PoolTimeProvider.displayName = 'PoolTimeProvider';

  return PoolTimeProvider;
};

export default createPoolTimeProvider;
