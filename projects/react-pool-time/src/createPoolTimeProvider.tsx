import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import PoolTime, {
  CoreAccuracyEntry,
  CoreConfiguration,
  PoolTimeOptions,
  Time,
  stringifyObject,
} from '../../pool-time-core/src/index';

import { TimeObjectWithContext } from './utilities/generateTimeObject';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';
import { ETERNITY } from './timeObjects';

export interface PoolTimeProviderProps {
  readonly children: React.ReactNode;
  readonly onIntervalChange?: (currentInterval: number) => void;
  readonly onRegister?: (timeKey: string) => void;
  readonly onUnregister?: (timeKey: string) => void;
}

interface ReactTimeContextProperty {
  readonly context: React.Context<Time>;
}

export type AccuracyEntry = CoreAccuracyEntry<ReactTimeContextProperty>;

export type Configuration = CoreConfiguration<ReactTimeContextProperty>;

function createPoolTimeProvider(configuration: Configuration): React.FC {
  const poolTimeOptions: PoolTimeOptions<ReactTimeContextProperty> = {
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

  const poolTime = new PoolTime<ReactTimeContextProperty>(poolTimeOptions);

  const PoolTimeProvider = React.memo(function PoolTimeProvider({
    children,
    onIntervalChange,
    onRegister,
    onUnregister,
  }: PoolTimeProviderProps) {
    const [registrations, setRegistrations] = useState(() =>
      poolTime.getRegistrations()
    );
    const [times, setTimes] = useState(() => poolTime.getTimes());
    const [lowestCommonDuration, setLowestCommonDuration] = useState(undefined);

    const onRegisterRef = useRef<(timeKey: string) => void>(onRegister);
    const onUnregisterRef = useRef<(timeKey: string) => void>(onUnregister);

    useLayoutEffect(() => {
      onRegisterRef.current = onRegister;
    }, [onRegister]);

    useLayoutEffect(() => {
      onUnregisterRef.current = onUnregister;
    }, [onUnregister]);

    const handleRegistration = useCallback((timeKey) => {
      setRegistrations((previousRegistrations) =>
        poolTime.register(previousRegistrations, timeKey)
      );

      onRegisterRef.current && onRegisterRef.current(timeKey);

      return {
        unregister: (): void => {
          setRegistrations((previousRegistrations) =>
            poolTime.unregister(previousRegistrations, timeKey)
          );

          onUnregisterRef.current && onUnregisterRef.current(timeKey);
        },
      };
    }, []);

    const onIntervalChangeRef = useRef<(currentInterval: number) => void>();

    useLayoutEffect(() => {
      onIntervalChangeRef.current = onIntervalChange;
    }, [onIntervalChange]);

    useLayoutEffect(() => {
      setLowestCommonDuration(poolTime.getLowestCommonDuration());
    }, [registrations]);

    // Any time the slowest time changes, we need to update the time for that
    // slowest time in order to guarantee that the accuracy specifications
    // hold true.
    useLayoutEffect(() => {
      if (!lowestCommonDuration) return;
      setTimes(poolTime.tickLowestCommonDuration);
    }, [lowestCommonDuration]);

    const hasPerformedInitialMount = useRef(false);

    useLayoutEffect(() => {
      if (lowestCommonDuration) {
        poolTime.startTicking(setTimes);

        onIntervalChangeRef.current &&
          onIntervalChangeRef.current(lowestCommonDuration.within.value);

        return function cleanup(): void {
          poolTime.stopTicking();
        };
      } else if (!hasPerformedInitialMount.current) {
        hasPerformedInitialMount.current = true;
      } else {
        onIntervalChangeRef.current && onIntervalChangeRef.current(null);
      }
    }, [lowestCommonDuration]);

    return (
      <ConfigurationContext.Provider value={configuration}>
        <RegistrationContext.Provider value={handleRegistration}>
          {Object.keys(times).reduce((accumulator, timeKey) => {
            const timeObject = times[timeKey];

            return (
              <timeObject.context.Provider value={timeObject}>
                {accumulator}
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
