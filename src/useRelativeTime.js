import { useContext, useRef } from 'react';
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

  const difference = Date.now() - targetTime;
  TimeContext.current = getOptimalTimeContext(
    difference,
    globalMaximumTolerance,
    scrictnessOptions
  );

  const { scale, time } = useContext(TimeContext.current);
  const rawDifference = time - targetTime;
  const timeDifference =
    rawDifference >= 0 ? Math.max(rawDifference, scale) : Math.min(rawDifference, scale);
  const timeWithFormat = timeFormatter(time);

  return generateRelativeTimeObject(scale, time, timeDifference, timeWithFormat);
};

export default useRelativeTime;
