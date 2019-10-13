import { ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY, ONE_MONTH, ONE_YEAR } from '../durations';

const getContextWithinGlobalMinimumAccuracy = (targetDuration, globalMinimumAccuracy) => {
  if (!globalMinimumAccuracy || targetDuration === globalMinimumAccuracy)
    return targetDuration.context;

  return globalMinimumAccuracy.value < targetDuration.value
    ? globalMinimumAccuracy.context
    : targetDuration.context;
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

  if (isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_MINUTE.value)) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions[ONE_SECOND.key] || ONE_SECOND,
      globalMinimumAccuracy
    );
  } else if (
    isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_HOUR.value, ONE_MINUTE.value)
  ) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions[ONE_MINUTE.key] || ONE_MINUTE,
      globalMinimumAccuracy
    );
  } else if (
    isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_DAY.value, ONE_HOUR.value)
  ) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions[ONE_HOUR.key] || ONE_HOUR,
      globalMinimumAccuracy
    );
  } else if (
    isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_MONTH.value, ONE_DAY.value)
  ) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions[ONE_DAY.key] || ONE_DAY,
      globalMinimumAccuracy
    );
  } else if (
    isAbsolutelyLessThanDuration(difference, absoluteDifference, ONE_YEAR.value, ONE_MONTH.value)
  ) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions[ONE_MONTH.key] || ONE_MONTH,
      globalMinimumAccuracy
    );
  } else if (
    isAbsolutelyLessThanDuration(difference, absoluteDifference, undefined, ONE_YEAR.value)
  ) {
    return getContextWithinGlobalMinimumAccuracy(
      strictnessOptions[ONE_YEAR.key] || ONE_YEAR,
      globalMinimumAccuracy
    );
  }
};

export default getOptimalTimeContext;
