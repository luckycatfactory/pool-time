const isAbsolutelyBetweenDurations = (
  difference,
  absoluteDifference,
  upperBound = Number.POSITIVE_INFINITY,
  lowerBound
) =>
  (difference >= 0 && difference >= lowerBound && difference < upperBound) ||
  (difference <= 0 && absoluteDifference > lowerBound && absoluteDifference <= upperBound);

// This function assumes that durations is an array with at least one duration.
// That's a fair assumption given that TimeProviders must have at least one
// duration.
const findCorrectDuration = (durations, difference, absoluteDifference) => {
  for (let i = 1; i <= durations.length; i++) {
    const lesserDuration = durations[i - 1];
    const greaterDuration = durations[i] || {};

    const isCorrectDuration =
      isAbsolutelyBetweenDurations(
        difference,
        absoluteDifference,
        greaterDuration && greaterDuration.value,
        lesserDuration && lesserDuration.value
      ) || !durations[i];

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
