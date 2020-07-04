import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import PoolTime, {
  CoreAccuracyEntry,
  CoreConfiguration,
  Time,
  stringifyObject,
} from '@luckycatfactory/pool-time-core';

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

function createPoolTimeProvider(
  poolTime: PoolTime<ReactTimeContextProperty>
): React.NamedExoticComponent<PoolTimeProviderProps> {
  if (process.env.NODE_ENV !== 'production') {
    poolTime.configuration.accuracies.forEach((validatedAccuracyEntry) => {
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
    });
  }

  const PoolTimeProvider = React.memo(function PoolTimeProvider({
    children,
    onIntervalChange,
    onRegister,
    onUnregister,
  }: PoolTimeProviderProps) {
    const [times, setTimes] = useState(() => poolTime.getTimes());
    const [lowestCommonDuration, setLowestCommonDuration] = useState(null);

    useLayoutEffect(() => {
      const unsubscribeFromLeastCommonDurationChange = poolTime.subscribeToLeastCommonDurationChange(
        setLowestCommonDuration
      );
      const unsubscribeFromTick = poolTime.subscribeToTick(setTimes);
      poolTime.flushInitialEmitQueue();

      return function cleanup(): void {
        unsubscribeFromLeastCommonDurationChange();
        unsubscribeFromTick();
      };
    }, []);

    const onRegisterRef = useRef<(timeKey: string) => void>(onRegister);
    const onUnregisterRef = useRef<(timeKey: string) => void>(onUnregister);

    useLayoutEffect(() => {
      onRegisterRef.current = onRegister;
    }, [onRegister]);

    useLayoutEffect(() => {
      onUnregisterRef.current = onUnregister;
    }, [onUnregister]);

    const handleRegistration = useCallback((timeKey) => {
      const unregister = poolTime.register(timeKey);

      onRegisterRef.current && onRegisterRef.current(timeKey);

      return {
        unregister: (): void => {
          unregister();

          onUnregisterRef.current && onUnregisterRef.current(timeKey);
        },
      };
    }, []);

    const onIntervalChangeRef = useRef<(currentInterval: number) => void>();

    useLayoutEffect(() => {
      onIntervalChangeRef.current = onIntervalChange;
    }, [onIntervalChange]);

    const hasPerformedInitialMount = useRef(false);

    useLayoutEffect(() => {
      if (lowestCommonDuration) {
        const stopTicking = poolTime.startTicking();

        onIntervalChangeRef.current &&
          onIntervalChangeRef.current(lowestCommonDuration.within.value);

        return function cleanup(): void {
          stopTicking();
        };
      } else if (!hasPerformedInitialMount.current) {
        hasPerformedInitialMount.current = true;
      } else {
        onIntervalChangeRef.current && onIntervalChangeRef.current(null);
      }
    }, [lowestCommonDuration]);

    return (
      <ConfigurationContext.Provider value={poolTime.configuration}>
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
