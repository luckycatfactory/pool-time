import { useContext, useEffect, useRef } from 'react';
import { DurationsContext, GlobalAccuracyContext } from '../TimeProviders';
import { getDateNow } from '../utilities';
import useOptimalTimeContext from './useOptimalTimeContext';

const generateRelativeTimeObject = (duration, time, timeDifference, timeWithFormat) => ({
  duration,
  time,
  timeDifference,
  timeWithFormat,
});

const defaultOptions = {};
const defaultTimeFormatter = inputTime => inputTime;

// const localAccuracy = useLocalAccuracy(() => {
//   return numberOfComments > 100 ? morePerformantConfiguration : moreAccurateConfiguration;
// }, [numberOfComments])
//
// const { difference } = useRelativeTime(time, { localAccuracy });
const useRelativeTime = (targetTime, options = defaultOptions) => {
  const { localAccuracy, timeFormatter = defaultTimeFormatter } = options;
  const directions = useContext(DurationsContext);
  const TimeContext = useRef(directions[0]);
  const hasRegisteredConsumer = useRef(false);
  const previousUnregisterConsumer = useRef(null);
  const isInitialRender = useRef(true);
  const globalAccuracy = useContext(GlobalAccuracyContext);

  const rawDifference = getDateNow() - targetTime;
  const nextTimeContext = useOptimalTimeContext(
    directions,
    rawDifference,
    globalAccuracy,
    localAccuracy
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
