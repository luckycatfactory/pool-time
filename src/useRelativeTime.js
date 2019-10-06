import { useContext, useEffect, useRef } from 'react';
import DayContext from './TimeProviders/DayContext';
import HourContext from './TimeProviders/HourContext';
import MinuteContext from './TimeProviders/MinuteContext';
import MonthContext from './TimeProviders/MonthContext';
import SecondContext from './TimeProviders/SecondContext';
import YearContext from './TimeProviders/YearContext';

import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_YEAR } from './constants';

const generateRelativeTimeObject = (scale, time, timeDifference, timeWithFormat) => ({
  scale,
  time,
  timeDifference,
  timeWithFormat,
});

const contextsInIncreasingDuration = [
  SecondContext,
  MinuteContext,
  HourContext,
  DayContext,
  MonthContext,
  YearContext,
];

const contextsByIndex = contextsInIncreasingDuration.reduce((map, context, index) => {
  map.set(context, index);
  return map;
}, new Map());

const compareContexts = (targetContext, globalMaximumTolerance) => {
  const targetContextIndex = contextsByIndex.get(targetContext);
  const globalMaximumToleranceIndex = contextsByIndex.get(globalMaximumTolerance);

  if (targetContextIndex === globalMaximumToleranceIndex) return 0;

  return targetContextIndex > globalMaximumToleranceIndex ? 1 : -1;
};

const getContextWithinGlobalMaximum = (targetContext, globalMaximumTolerance) => {
  if (!globalMaximumTolerance || targetContext === globalMaximumTolerance) return targetContext;

  const comparisonValue = compareContexts(targetContext, globalMaximumTolerance);

  return comparisonValue === 1 ? globalMaximumTolerance : targetContext;
};

const getOptimalTimeContext = (difference, globalMaximumTolerance, strictnessOptions) => {
  if (difference < ONE_MINUTE) {
    return getContextWithinGlobalMaximum(
      strictnessOptions.seconds || SecondContext,
      globalMaximumTolerance
    );
  } else if (difference >= ONE_MINUTE && difference < ONE_HOUR) {
    return getContextWithinGlobalMaximum(
      strictnessOptions.minutes || MinuteContext,
      globalMaximumTolerance
    );
  } else if (difference >= ONE_HOUR && difference < ONE_DAY) {
    return getContextWithinGlobalMaximum(
      strictnessOptions.hours || HourContext,
      globalMaximumTolerance
    );
  } else if (difference >= ONE_DAY && difference < ONE_MONTH) {
    return getContextWithinGlobalMaximum(
      strictnessOptions.days || DayContext,
      globalMaximumTolerance
    );
  } else if (difference >= ONE_MONTH && difference < ONE_YEAR) {
    return getContextWithinGlobalMaximum(
      strictnessOptions.months || MonthContext,
      globalMaximumTolerance
    );
  } else if (difference >= ONE_YEAR) {
    return getContextWithinGlobalMaximum(
      strictnessOptions.years || YearContext,
      globalMaximumTolerance
    );
  }
};

const useRelativeTime = (targetTime, options = {}) => {
  const {
    globalMaximumTolerance,
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

  const difference = Date.now() - targetTime;
  const nextTimeContext = getOptimalTimeContext(
    difference,
    globalMaximumTolerance,
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
