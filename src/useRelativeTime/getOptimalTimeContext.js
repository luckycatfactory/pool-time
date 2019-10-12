import DayContext from '../TimeProviders/DayContext';
import HourContext from '../TimeProviders/HourContext';
import MinuteContext from '../TimeProviders/MinuteContext';
import MonthContext from '../TimeProviders/MonthContext';
import SecondContext from '../TimeProviders/SecondContext';
import YearContext from '../TimeProviders/YearContext';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from '../constants';

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

export default getOptimalTimeContext;
