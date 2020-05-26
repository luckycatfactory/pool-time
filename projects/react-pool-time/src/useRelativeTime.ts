import { useContext, useLayoutEffect, useMemo } from 'react';

import ApplicationInitializationTimeContext from './contexts/ApplicationInitializationTimeContext';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';
import { AccuracyEntry } from './createPoolTimeProvider';
import { TimeContextValue } from './utilities/generateTimeObject';

export interface UseRelativeTimeResponse {
  readonly difference: number;
  readonly time: number;
}

export type UseRelativeTime = () => UseRelativeTimeResponse;

const findAccuracy = (
  accuracies: AccuracyEntry[],
  targetTime: number
): AccuracyEntry => {
  const now = Date.now();
  const difference = Math.abs(now - targetTime);

  const accuracy = accuracies.find(({ upTo }) => upTo.value > difference);

  return accuracy;
};

const useOptimalContext = (
  targetTime: number,
  skip: boolean
): React.Context<TimeContextValue> => {
  const configuration = useContext(ConfigurationContext);

  const {
    within: { context, key = '' },
  } = skip
    ? { within: { context: ApplicationInitializationTimeContext } }
    : findAccuracy(configuration.accuracies, targetTime);

  const register = useContext(RegistrationContext);

  useLayoutEffect(() => {
    if (skip) return;
    const { unregister } = register(key);

    return (): void => {
      unregister();
    };
  }, [key, register, skip]);

  return context;
};

const useRelativeTime = (
  targetTime: number,
  { skip = false } = {}
): UseRelativeTimeResponse => {
  const optimalContext = useOptimalContext(targetTime, skip);

  const { time } = useContext(optimalContext);

  const difference = useMemo(() => (skip ? 0 : time - targetTime), [
    skip,
    targetTime,
    time,
  ]);

  const response = useMemo(
    () => ({
      difference,
      time: skip ? Date.now() : time,
    }),
    [difference, skip, time]
  );

  return response;
};

export default useRelativeTime;
