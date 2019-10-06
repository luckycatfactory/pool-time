import { useContext, useEffect, useRef } from 'react';
import DayContext from './TimeProviders/DayContext';
import GlobalMinimumAccuracyContext from './TimeProviders/GlobalMinimumAccuracyContext';
import HourContext from './TimeProviders/HourContext';
import MinuteContext from './TimeProviders/MinuteContext';
import MonthContext from './TimeProviders/MonthContext';
import SecondContext from './TimeProviders/SecondContext';
import YearContext from './TimeProviders/YearContext';

import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from './constants';

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

const getOptimalTimeContext = (difference, globalMinimumAccuracy, strictnessOptions) => {
  if (difference < ONE_MINUTE) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.seconds || SecondContext,
      globalMinimumAccuracy
    );
  } else if (difference >= ONE_MINUTE && difference < ONE_HOUR) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.minutes || MinuteContext,
      globalMinimumAccuracy
    );
  } else if (difference >= ONE_HOUR && difference < ONE_DAY) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.hours || HourContext,
      globalMinimumAccuracy
    );
  } else if (difference >= ONE_DAY && difference < ONE_MONTH) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.days || DayContext,
      globalMinimumAccuracy
    );
  } else if (difference >= ONE_MONTH && difference < ONE_YEAR) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.months || MonthContext,
      globalMinimumAccuracy
    );
  } else if (difference >= ONE_YEAR) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions.years || YearContext,
      globalMinimumAccuracy
    );
  }
};

const useRelativeTime = (targetTime, options = {}) => {
  const {
    scrictnessOptions = {
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
  const globalMinimumAccuracy = useContext(GlobalMinimumAccuracyContext);

  const difference = Date.now() - targetTime;
  const nextTimeContext = getOptimalTimeContext(
    difference,
    globalMinimumAccuracy,
    scrictnessOptions
  );

  if (TimeContext.current !== nextTimeContext && previousUnregisterConsumer.current) {
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

  const rawDifference = time - targetTime;
  const timeDifference =
    rawDifference >= 0 ? Math.max(rawDifference, scale) : Math.min(rawDifference, scale);
  const timeWithFormat = timeFormatter(time);

  return generateRelativeTimeObject(scale, time, timeDifference, timeWithFormat);
};

export default useRelativeTime;
