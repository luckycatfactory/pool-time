const isAbsolutelyBetweenDurations = (
  difference,
  absoluteDifference,
  upperBound = Number.POSITIVE_INFINITY,
  lowerBound = Number.NEGATIVE_INFINITY
) =>
  (difference >= 0 && difference >= lowerBound && difference < upperBound) ||
  (difference <= 0 && absoluteDifference > lowerBound && absoluteDifference <= upperBound);

const findCorrectDuration = (durations, difference, absoluteDifference) => {
  for (let i = 1; i <= durations.length; i++) {
    const lesserDuration = durations[i - 1] || {};
    const greaterDuration = durations[i] || {};

    const isCorrectDuration = isAbsolutelyBetweenDurations(
      difference,
      absoluteDifference,
      greaterDuration && greaterDuration.value,
      lesserDuration && lesserDuration.value
    );

    if (isCorrectDuration) {
      return lesserDuration;
    }
  }
};

const useOptimalTimeContext = (durations, difference, globalAccuracy, localAccuracy) => {
  const absoluteDifference = Math.abs(difference);

  const duration = findCorrectDuration(durations, difference, absoluteDifference);

  return globalAccuracy.getOptimalContext(duration, localAccuracy);
};

export default useOptimalTimeContext;
