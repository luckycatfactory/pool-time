import { useContext, useEffect, useRef } from 'react';
import GlobalMinimumAccuracyContext from '../TimeProviders/GlobalMinimumAccuracyContext';
import SecondContext from '../TimeProviders/SecondContext';
import { getDateNow } from '../utilities';
import getOptimalTimeContext from './getOptimalTimeContext';

const generateRelativeTimeObject = (duration, time, timeDifference, timeWithFormat) => ({
  duration,
  time,
  timeDifference,
  timeWithFormat,
});

const useRelativeTime = (targetTime, options = {}) => {
  const { strictnessOptions = {}, timeFormatter = inputTime => inputTime } = options;
  const TimeContext = useRef(SecondContext);
  const hasRegisteredConsumer = useRef(false);
  const previousUnregisterConsumer = useRef(null);
  const isInitialRender = useRef(true);
  const globalMinimumAccuracy = useContext(GlobalMinimumAccuracyContext);

  const rawDifference = getDateNow() - targetTime;
  const nextTimeContext = getOptimalTimeContext(
    rawDifference,
    globalMinimumAccuracy,
    strictnessOptions
  );

  const hasContextUpdated = TimeContext.current !== nextTimeContext;

  if (hasContextUpdated && previousUnregisterConsumer.current) {
    previousUnregisterConsumer.current();
    hasRegisteredConsumer.current = false;
  }

  TimeContext.current = nextTimeContext;

  const { duration, registerConsumer, time, unregisterConsumer } = useContext(TimeContext.current);

  previousUnregisterConsumer.current = unregisterConsumer;

  if (!hasRegisteredConsumer.current) {
    registerConsumer();
    hasRegisteredConsumer.current = true;
  }

  // This performs the unregistration after unmount.
  useEffect(
    () => () => {
      previousUnregisterConsumer.current();
    },
    []
  );

  const differenceAccountingForContextChange = hasContextUpdated
    ? rawDifference
    : time - targetTime;
  const timeDifferenceToUse = hasContextUpdated
    ? differenceAccountingForContextChange >= 0
      ? Math.max(differenceAccountingForContextChange, duration)
      : Math.min(differenceAccountingForContextChange, duration)
    : isInitialRender.current
    ? rawDifference
    : differenceAccountingForContextChange;
  const preferredTime = hasContextUpdated ? getDateNow() : time;
  const timeWithFormat = timeFormatter(preferredTime);

  if (isInitialRender.current) {
    isInitialRender.current = false;
  }

  return generateRelativeTimeObject(duration, preferredTime, timeDifferenceToUse, timeWithFormat);
};

export default useRelativeTime;
