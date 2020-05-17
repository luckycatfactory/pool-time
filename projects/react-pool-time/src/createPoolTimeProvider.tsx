import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { TimeObject } from './utilities/generateTimeObject';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';

interface PoolTimeProviderProps {
  readonly children: React.ReactNode;
  readonly onIntervalChange?: () => undefined;
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

const createPoolTimeProvider = (configuration: Configuration): React.FC => {
  const PoolTimeProvider = React.memo(
    ({ children, onIntervalChange }: PoolTimeProviderProps) => {
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
        configuration.accuracies.reduce<TimesState>(
          (acc, { within: { key } }) => {
            acc[key] = Date.now();
            return acc;
          },
          {}
        )
      );

      const handleRegistration = useCallback((timeKey) => {
        setRegistrations((previousRegistrations) => ({
          ...previousRegistrations,
          [timeKey]: previousRegistrations[timeKey] + 1,
        }));

        return {
          unregister: (): void => {
            setRegistrations((previousRegistrations) => ({
              ...previousRegistrations,
              [timeKey]: previousRegistrations[timeKey] - 1,
            }));
          },
        };
      }, []);

      const onIntervalChangeRef = useRef<() => void>();

      useEffect(() => {
        onIntervalChangeRef.current = onIntervalChange;
      }, [onIntervalChange]);

      useLayoutEffect(() => {
        const slowestTime = configuration.accuracies.find((el) =>
          Boolean(registrations[el.within.key])
        );

        if (slowestTime) {
          onIntervalChangeRef.current && onIntervalChangeRef.current();

          const id = setInterval(() => {
            setTimes(
              (previousTimes) =>
                configuration.accuracies.reduce<{
                  hasShortCircuited: boolean;
                  nextTimes: TimesState;
                }>(
                  (acc, { within: { key, value } }) => {
                    if (acc.hasShortCircuited) {
                      acc.nextTimes[key] = previousTimes[key];
                      return acc;
                    }
                    const previousTimeRoundedToValue =
                      Math.round(previousTimes[key] / value) * value;
                    const nowRoundedToValue =
                      Math.round(Date.now() / value) * value;
                    const timeSinceLastUpdate =
                      nowRoundedToValue - previousTimeRoundedToValue;
                    if (key === 'ONE_SECOND') {
                      console.log(
                        'time since last update',
                        key,
                        timeSinceLastUpdate,
                        registrations
                      );
                    }
                    if (timeSinceLastUpdate * value >= value) {
                      acc.nextTimes[key] = Date.now();
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

          return (): void => {
            clearInterval(id);
          };
        }
      }, [onIntervalChange, registrations]);

      return (
        <ConfigurationContext.Provider value={configuration}>
          <RegistrationContext.Provider value={handleRegistration}>
            {configuration.accuracies.reduce((acc, timeObject) => {
              const timeValue = times[timeObject.within.key];

              return (
                <timeObject.within.context.Provider
                  value={{ time: timeValue, value: timeValue }}
                >
                  {acc}
                </timeObject.within.context.Provider>
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
