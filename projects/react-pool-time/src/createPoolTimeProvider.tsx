import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  TimeObject,
  TimeObjectContextValue,
} from './utilities/generateTimeObject';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';

export interface PoolTimeProviderProps {
  readonly children: React.ReactNode;
  readonly onIntervalChange?: (currentInterval: number) => void;
  readonly onRegister?: (timeKey: string) => void;
  readonly onUnregister?: (timeKey: string) => void;
}

export interface AccuracyEntry {
  readonly upTo: TimeObject;
  readonly within: TimeObject;
}

export interface Configuration {
  readonly accuracies: AccuracyEntry[];
}

interface RegistrationState {
  [withinKey: string]: number;
}

interface TimesState {
  [withinKey: string]: number;
}

type TimeObjectContextValueWithContext = TimeObjectContextValue & {
  context: React.Context<TimeObjectContextValue>;
};

const createPoolTimeProvider = (configuration: Configuration): React.FC => {
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
          [timeKey: string]: TimeObjectContextValueWithContext;
        }>((acc, { within: { context, key, value } }) => {
          acc[key] = { context, time: Date.now(), value };
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
                    [timeKey: string]: TimeObjectContextValueWithContext;
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
