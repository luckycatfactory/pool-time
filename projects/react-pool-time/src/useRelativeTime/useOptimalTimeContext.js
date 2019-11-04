const isAbsolutelyBetweenDurations = (
  difference,
  absoluteDifference,
  upperBound = Number.POSITIVE_INFINITY,
  lowerBound = Number.NEGATIVE_INFINITY
) =>
  (difference >= 0 && difference >= lowerBound && difference < upperBound) ||
  (difference <= 0 && absoluteDifference > lowerBound && absoluteDifference <= upperBound);

// This function assumes that durations is an array with at least one duration.
// That's a fair assumption given that TimeProviders must have at least one
// duration.
// const findCorrectDuration = (durations, difference, absoluteDifference) => {
//   let i = -1;
//   let j = 0;
//
//   while (i < durations.length && j <= durations.length) {
//     const lesserDuration = durations[i] || {};
//     const greaterDuration = durations[j] || {};
//   }
//   for (let i = 0; i <= durations.length; i++) {
//     const lesserDuration = durations[i - 1] || {};
//     const greaterDuration = durations[i] || {};
//
//     const isCorrectDuration =
//       isAbsolutelyBetweenDurations(
//         difference,
//         absoluteDifference,
//         greaterDuration && greaterDuration.value,
//         lesserDuration && lesserDuration.value
//       ) || !durations[i];
//
//     if (isCorrectDuration) {
//       if (!durations[i - 1]) {
//         return greaterDuration;
//       } else if (!durations[i]) {
//         return lesserDuration;
//       } else {
//         return lesserDuration;
//       }
//     }
//   }
// };

const useOptimalTimeContext = (durations, difference, globalAccuracy, localAccuracy) => {
  // const absoluteDifference = Math.abs(difference);

  // const duration = findCorrectDuration(durations, difference, absoluteDifference, globalAccuracy);
  //
  // console.log('d', duration.key);

  return globalAccuracy.getOptimalContext(difference, localAccuracy);
};

export default useOptimalTimeContext;
