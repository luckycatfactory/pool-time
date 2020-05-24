import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  TimeContextValue,
  TimeObject,
  TimeObjectWithContext,
} from './utilities/generateTimeObject';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';
import { ETERNITY } from './timeObjects';

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

type TimeContextValueWithContext = TimeContextValue & {
  context: React.Context<TimeContextValue>;
};

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

      useLayoutEffect(() => {
        if (slowestTime) {
          const id = setInterval(() => {
            setTimes(
              (previousTimes) =>
                configuration.accuracies.reduce<{
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
                    const previousTimeRoundedToValue =
                      Math.round(previousTimes[key].value / value) * value;
                    const nowRoundedToValue =
                      Math.round(Date.now() / value) * value;
                    const timeSinceLastUpdate =
                      nowRoundedToValue - previousTimeRoundedToValue;

                    if (timeSinceLastUpdate >= value) {
                      acc.nextTimes[key] = { context, time: Date.now(), value };
                    } else {
                      acc.nextTimes[key] = previousTimes[key];
                      acc.hasShortCircuited = true;
                    }
                    return acc;
                  },
                  { hasShortCircuited: false, nextTimes: {} }
                ).nextTimes
            );
          }, slowestTime.within.value);

          onIntervalChangeRef.current &&
            onIntervalChangeRef.current(slowestTime.within.value);

          return (): void => {
            clearInterval(id);
          };
        }
        // If registrations changes, that will churn the slowestTimeRef in the
        // event that the slowest time changes. Therefore, we can rely on that
        // ref's .current value to re-trigger this effect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
