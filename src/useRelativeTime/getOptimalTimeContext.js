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
  console.log('attempting', difference, absoluteDifference, upperBound, lowerBound) ||
  (difference >= 0 && difference >= lowerBound && difference < upperBound) ||
  (difference <= 0 && absoluteDifference > lowerBound && absoluteDifference <= upperBound);

const getOptimalTimeContext = (durations, difference, globalMinimumAccuracy, strictnessOptions) => {
  const absoluteDifference = Math.abs(difference);

  console.log('here we go', durations, difference, globalMinimumAccuracy, strictnessOptions);

  for (let i = 0; i <= durations.length; i++) {
    const lesserDuration = durations[i - 1] || {};
    const greaterDuration = durations[i] || {};
    // console.log('hit it?', lesserDuration, greaterDuration);

    const isCorrectDuration = isAbsolutelyLessThanDuration(
      difference,
      absoluteDifference,
      greaterDuration && greaterDuration.value,
      lesserDuration && lesserDuration.value
    );

    if (isCorrectDuration) {
      return getContextWithinGlobalMinimumAccuracy(
        strictnessOptions[lesserDuration.key] || lesserDuration,
        globalMinimumAccuracy
      );
    }
  }
};

export default getOptimalTimeContext;
