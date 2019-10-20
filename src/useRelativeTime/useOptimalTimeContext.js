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

// // An array is used so we don't have to do things like { [ONE_SECOND.key]: ... }.
// //
// // This array should be in ascending order by "difference" values without any duplicates.
// //
// const accuracy = [
//   {
//     difference: ONE_SECOND,
//     maximumAccuracy: ONE_SECOND,
//     minimumAccuracy: FIVE_SECONDS,
//     preferredAccuracy: ONE_SECOND,
//   },
//   {
//     difference: ONE_HOUR, // For all time differences greater than or equal to one hour (up to the next time setting)...
//     maximumAccuracy: ONE_MINUTE, // if a time renderer specifies its own accuracy setting, don't ever allow it to request being more accurate than by five seconds...
//     minimumAccuracy: FIVE_MINUTES, // and also don't allow it to be more than thirty seconds off...
//     preferredAccuracy: ONE_MINUTE, // but it in the cases that time renderers do not specify a time, default to being accurate within five seconds.
//   }
// ]
//
// <TimeProviders accuracy={accuracy} />
//
// ...
// const { difference } = useRelativeTime(someTime, { stuff: 'hi' });

const mergeAccuracy = (globalAccuracy, localAccuracy) => {};

const useMaterializedGlobalAccuracy = globalAccuracy => {
  globalAccuracy;
};

const useOptimalTimeContext = (durations, difference, globalAccuracy, localAccuracy) => {
  const absoluteDifference = Math.abs(difference);

  for (let i = 0; i <= durations.length; i++) {
    const lesserDuration = durations[i - 1] || {};
    const greaterDuration = durations[i] || {};

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

export default useOptimalTimeContext;
