import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import PoolTime, {
  CoreAccuracyEntry,
  CoreConfiguration,
  PoolTimeOptions,
  stringifyObject,
} from '../../pool-time-core/src/index';

import {
  TimeContextValue,
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

export type AccuracyEntry = CoreAccuracyEntry<TimeObjectWithContext>;

export type Configuration = CoreConfiguration<TimeObjectWithContext>;

interface RegistrationState {
  [withinKey: string]: number;
}

interface TimeState {
  context: React.Context<TimeContextValue>;
  time: number;
  value: number;
}

function createPoolTimeProvider(configuration: Configuration): React.FC {
  const poolTimeOptions: PoolTimeOptions<TimeObjectWithContext> = {
    configuration,
  };

  if (process.env.NODE_ENV !== 'production') {
    poolTimeOptions.onAccuracyEntryValidation = function reactAccuracyEntryValidation(
      validatedAccuracyEntry: AccuracyEntry
    ): void {
      if (
        validatedAccuracyEntry.upTo !== ETERNITY &&
        !(validatedAccuracyEntry.upTo as TimeObjectWithContext).context
      ) {
        throw new Error(
          `Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, but instead received: ${stringifyObject(
            validatedAccuracyEntry.upTo
          )}.`
        );
      }

      if (!validatedAccuracyEntry.within.context) {
        throw new Error(
          `Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a context, but instead received: ${stringifyObject(
            validatedAccuracyEntry.within
          )}.`
        );
      }
    };
  }

  const poolTime = new PoolTime(poolTimeOptions);

  const PoolTimeProvider = React.memo(function PoolTimeProvider({
    children,
    onIntervalChange,
    onRegister,
    onUnregister,
  }: PoolTimeProviderProps) {
    const [registrations, setRegistrations] = useState(() =>
      poolTime.configuration.accuracies.reduce<RegistrationState>(
        (acc, { within: { key } }) => {
          acc[key] = 0;
          return acc;
        },
        {}
      )
    );
    const [times, setTimes] = useState(() =>
      poolTime.configuration.accuracies.reduce<{
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
  });

  return PoolTimeProvider;
}

export default createPoolTimeProvider;
