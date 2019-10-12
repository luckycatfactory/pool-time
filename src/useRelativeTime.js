import { useContext, useEffect, useRef } from 'react';
import DayContext from './TimeProviders/DayContext';
import GlobalMinimumAccuracyContext from './TimeProviders/GlobalMinimumAccuracyContext';
import HourContext from './TimeProviders/HourContext';
import MinuteContext from './TimeProviders/MinuteContext';
import MonthContext from './TimeProviders/MonthContext';
import SecondContext from './TimeProviders/SecondContext';
import YearContext from './TimeProviders/YearContext';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from './constants';
import { getDateNow } from './utilities';

const generateRelativeTimeObject = (scale, time, timeDifference, timeWithFormat) => ({
  scale,
  time,
  timeDifference,
  timeWithFormat,
});

const durationsToContexts = {
  [ONE_DAY]: DayContext,
  [ONE_HOUR]: HourContext,
  [ONE_MINUTE]: MinuteContext,
  [ONE_MONTH]: MonthContext,
  [ONE_SECOND]: SecondContext,
  [ONE_YEAR]: YearContext,
};

const getContextWithinGlobalMinimumAccuracy = (targetContext, globalMinimumAccuracy) => {
  if (!globalMinimumAccuracy || targetContext === globalMinimumAccuracy) return targetContext;

  const targetDuration = Object.keys(durationsToContexts).find(key => {
    const context = durationsToContexts[key];
    return context === targetContext;
  });

  const ultimateDuration = Math.min(targetDuration, globalMinimumAccuracy);

  return durationsToContexts[ultimateDuration];
};

const isAbsolutelyLessThanDuration = (
  difference,
  absoluteDifference,
  upperBound = Number.POSITIVE_INFINITY,
  lowerBound = Number.NEGATIVE_INFINITY
) =>
  (difference >= 0 && difference >= lowerBound && difference < upperBound) ||
  (difference <= 0 && absoluteDifference > lowerBound && absoluteDifference <= upperBound);

const getOptimalTimeContext = (difference, globalMinimumAccuracy, strictnessOptions) => {
  const absoluteDifference = Math.abs(difference);

  if (isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_MINUTE)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.seconds || SecondContext,
      globalMinimumAccuracy
    );
  } else if (isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_HOUR, ONE_MINUTE)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.minutes || MinuteContext,
      globalMinimumAccuracy
    );
  } else if (isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_DAY, ONE_HOUR)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.hours || HourContext,
      globalMinimumAccuracy
    );
  } else if (isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_MONTH, ONE_DAY)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.days || DayContext,
      globalMinimumAccuracy
    );
  } else if (isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_YEAR, ONE_MONTH)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.months || MonthContext,
      globalMinimumAccuracy
    );
  } else if (isAbsolutelyLessThanDuration(difference, absoluteDifference, undefined, ONE_YEAR)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.years || YearContext,
      globalMinimumAccuracy
    );
  }
};

const useRelativeTime = (targetTime, options = {}) => {
  const {
    strictnessOptions = {
      days: DayContext,
      hours: HourContext,
      minutes: MinuteContext,
      months: MonthContext,
      seconds: SecondContext,
      years: YearContext,
    },
    timeFormatter = inputTime => inputTime,
  } = options;
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

  const { registerConsumer, scale, time, unregisterConsumer } = useContext(TimeContext.current);

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
      ? Math.max(differenceAccountingForContextChange, scale)
      : Math.min(differenceAccountingForContextChange, scale)
    : isInitialRender.current
    ? rawDifference
    : differenceAccountingForContextChange;
  const preferredTime = hasContextUpdated ? getDateNow() : time;
  const timeWithFormat = timeFormatter(preferredTime);

  if (isInitialRender.current) {
    isInitialRender.current = false;
  }

  return generateRelativeTimeObject(scale, preferredTime, timeDifferenceToUse, timeWithFormat);
};

export default useRelativeTime;
