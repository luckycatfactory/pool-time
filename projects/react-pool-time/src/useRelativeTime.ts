import { useContext, useLayoutEffect, useMemo, useRef } from 'react';

import ApplicationInitializationTimeContext from './contexts/ApplicationInitializationTimeContext';
import ConfigurationContext from './contexts/ConfigurationContext';
import RegistrationContext from './contexts/RegistrationContext';
import { AccuracyEntry } from './createPoolTimeProvider';
import { TimeContextValue } from './utilities/generateTimeObject';

export interface UseRelativeTimeResponse {
  readonly difference: number;
  readonly getRoundedDifference: () => number;
  readonly time: number;
}

export type UseRelativeTime = () => UseRelativeTimeResponse;

export enum RoundingStrategy {
  CEILING = 'ceiling',
  FLOOR = 'floor',
  NONE = 'none',
  ROUNDED = 'rounded',
}

export interface UseRelativeTimeOptions {
  readonly roundingStrategy?: RoundingStrategy;
  readonly skip?: boolean;
}

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

const invalidRoundingStrategy = (roundingStrategy: unknown): never => {
  throw new Error(
    `Expected roundingStrategy to be one of [${Object.values(
      RoundingStrategy
    ).join(', ')}], but received ${roundingStrategy}.`
  );
};

// Allowing for negative zero will probably introduce more headaches than its
// worth for consumers. Let's just avoid the concept altogether.
const coerceNegativeZero = (value: number): number =>
  value === -0 ? 0 : value; // eslint-disable-line no-compare-neg-zero

const performDifferenceRounding = (
  roundingFunction: (input: number) => number,
  difference: number,
  accuracyValue: number
): number =>
  coerceNegativeZero(
    roundingFunction(difference / accuracyValue) * accuracyValue
  );

const noOpRounding = (number: number): number => number;

const handleRoundedDifference = (
  difference: number,
  roundingStrategy: RoundingStrategy,
  accuracyValue: number
): number => {
  switch (roundingStrategy) {
    case RoundingStrategy.ROUNDED: {
      return performDifferenceRounding(Math.round, difference, accuracyValue);
    }
    case RoundingStrategy.CEILING: {
      return performDifferenceRounding(Math.ceil, difference, accuracyValue);
    }
    case RoundingStrategy.FLOOR: {
      return performDifferenceRounding(Math.floor, difference, accuracyValue);
    }
    case RoundingStrategy.NONE: {
      return performDifferenceRounding(noOpRounding, difference, accuracyValue);
    }
    default: {
      invalidRoundingStrategy(roundingStrategy);
    }
  }
};

const useRelativeTime = (
  targetTime: number,
  {
    roundingStrategy = RoundingStrategy.ROUNDED,
    skip = false,
  }: UseRelativeTimeOptions = {}
): UseRelativeTimeResponse => {
  const optimalContext = useOptimalContext(targetTime, skip);

  const { time, value } = useContext(optimalContext);

  const difference = useMemo(() => (skip ? 0 : time - targetTime), [
    skip,
    targetTime,
    time,
  ]);

  const differenceRef = useRef(difference);

  useLayoutEffect(() => {
    differenceRef.current = difference;
  }, [difference]);

  const roundingStrategyRef = useRef(roundingStrategy);

  useLayoutEffect(() => {
    roundingStrategyRef.current = roundingStrategy;
  }, [roundingStrategy]);

  const currentAccuracyValueRef = useRef(value);

  useLayoutEffect(() => {
    currentAccuracyValueRef.current = value;
  }, [value]);

  const getRoundedDifference = useRef(() => {
    const { current: difference } = differenceRef;

    return handleRoundedDifference(
      difference,
      roundingStrategyRef.current,
      currentAccuracyValueRef.current
    );
  });

  const response = useMemo(
    () => ({
      difference,
      getRoundedDifference: getRoundedDifference.current,
      time: skip ? Date.now() : time,
    }),
    [difference, skip, time]
  );

  return response;
};

export default useRelativeTime;
