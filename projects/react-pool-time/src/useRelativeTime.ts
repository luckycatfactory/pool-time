import { useContext, useLayoutEffect, useRef } from 'react';

import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';
import { AccuracyEntry } from './createPoolTimeProvider';
import { TimeObjectContextValue } from './utilities/generateTimeObject';

export interface UseRelativeTimeResponse {
  readonly time: number;
}

export type UseRelativeTime = () => UseRelativeTimeResponse;

const findAccuracy = (
  accuracies: AccuracyEntry[],
  targetTime: number
): AccuracyEntry => {
  const now = Date.now();
  const difference = now - targetTime;

  const accuracy =
    accuracies.find(({ upTo }) => upTo.value > difference) ||
    accuracies[accuracies.length - 1];

  return accuracy;
};

const useOptimalContext = (
  targetTime: number
): React.Context<TimeObjectContextValue> => {
  const configuration = useContext(ConfigurationContext);

  const {
    within: { context, key },
  } = findAccuracy(configuration.accuracies, targetTime);

  const register = useContext(RegistrationContext);

  useLayoutEffect(() => {
    const { unregister } = register(key);

    return (): void => {
      unregister();
    };
  }, [key, register]);

  return context;
};

const useRelativeTime = (targetTime: number): UseRelativeTimeResponse => {
  const optimalContext = useOptimalContext(targetTime);

  const { time } = useContext(optimalContext);

  const timeRef = useRef(time);

  return useRef({
    time: timeRef.current,
  }).current;
};

export default useRelativeTime;
