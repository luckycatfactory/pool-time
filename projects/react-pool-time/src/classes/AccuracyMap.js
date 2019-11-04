import AccuracyEntry from './AccuracyEntry';
import AccuracyList from './AccuracyList';
import DurationList from './DurationList';
import { ONE_SECOND } from '../durations';

class InvalidAccuracyMapInputError extends Error {}

const validateDurationList = durations => {
  if (!(durations instanceof DurationList)) {
    throw new InvalidAccuracyMapInputError(
      'Expected durations to be a DurationList, but it was not.'
    );
  }

  return durations;
};

const validateAccuracyList = accuracyList => {
  if (!(accuracyList instanceof AccuracyList)) {
    throw new Error('Expected accuracy list to be an instance of AccuracyList, but it was not.');
  }

  return accuracyList;
};

const validateAccuracyListStartsWithSmallestDuration = (durationList, accuracyList) => {
  const smallestDuration = durationList.get()[0];
  if (accuracyList.get()[0].difference !== smallestDuration) {
    throw new Error(
      'Accuracy specifications must begin with the shortest duration passed to the TimeProviders.'
    );
  }
};

const validateAllAccuraciesAreInDurations = accuracyMap => {
  Object.values(accuracyMap).forEach(accuracyEntry => {
    Object.values(accuracyEntry).forEach(accuracySpecification => {
      if (!accuracyMap[accuracySpecification.key]) {
        throw new Error(
          `Invalid accuracy of ${accuracySpecification.key} passed for differences of ${accuracyEntry.difference.key}. All accuracy specifications must have corresponding durations passed to the TimeProviders.`
        );
      }
    });
  });

  return accuracyMap;
};

// At the point that this is called, durationList and accuracyList are both in ascending order.
const makeAccuracyListIntoObject = (durationList, accuracyList) => {
  const durations = durationList.get();
  const accuracies = accuracyList.get();
  let currentAccuracyIndex = 0;

  const accuracyMap = durations.reduce((accumulator, duration) => {
    const currentAccuracy = accuracies[currentAccuracyIndex];
    accumulator[duration.key] = new AccuracyEntry({ ...currentAccuracy, difference: duration });

    if (currentAccuracy.difference !== duration && currentAccuracyIndex < accuracies.length - 1) {
      currentAccuracyIndex++;
    }

    return accumulator;
  }, {});

  return validateAllAccuraciesAreInDurations(accuracyMap);
};

class InvalidAccuracyMapRequestError extends Error {}

const isDurationWithinRange = (duration, lowerBound, upperBound) =>
  duration.value >= lowerBound.value && duration.value <= upperBound.value;

const greaterDuration = (first, second) => (first.value >= second.value ? first : second);
const lesserDuration = (first, second) => (first.value <= second.value ? first : second);

class AccuracyMap {
  constructor(durations, accuracyList) {
    this.durationList = validateDurationList(durations);
    this.accuracyList = validateAccuracyList(accuracyList);
    validateAccuracyListStartsWithSmallestDuration(this.durationList, this.accuracyList);
    this.value = makeAccuracyListIntoObject(this.durationList, this.accuracyList);
  }

  getOptimalEntry(duration) {
    const entry = this.value[duration.key];

    if (!entry) {
      throw new InvalidAccuracyMapRequestError(
        `Unable to find an appropriate entry for duration with key "${duration.key}".`
      );
    }

    const targetAccuracyEntry = this.value[duration.key];

    return targetAccuracyEntry;
  }

  getOptimalDuration(duration, localAccuracyMap) {
    const targetEntry = this.getOptimalEntry(duration);

    if (!localAccuracyMap) {
      return targetEntry.preferredAccuracy;
    }

    const localEntry = localAccuracyMap.getOptimalEntry(duration);

    const isLocalPreferredAccuracyWithinRange = isDurationWithinRange(
      localEntry.preferredAccuracy,
      targetEntry.maximumAccuracy,
      targetEntry.minimumAccuracy
    );

    if (isLocalPreferredAccuracyWithinRange) {
      return localEntry.preferredAccuracy;
    }

    const isLocalPreferredAccuracyGreaterThanGlobal =
      localEntry.preferredAccuracy.value > targetEntry.maximumAccuracy.value;

    if (isLocalPreferredAccuracyGreaterThanGlobal) {
      return greaterDuration(localEntry.maximumAccuracy, targetEntry.minimumAccuracy);
    }

    const isLocalPreferredAccuracyLessThanGlobal =
      localEntry.preferredAccuracy.value < targetEntry.minimumAccuracy.value;

    if (isLocalPreferredAccuracyLessThanGlobal) {
      return lesserDuration(localEntry.minimumAccuracy, targetEntry.maximumAccuracy);
    }
  }

  getOptimalContext(difference, localAccuracyMap) {
    const absoluteDifference = Math.abs(difference);
    const accuracyListArray = this.accuracyList.get();

    let targetDuration = accuracyListArray[0].difference;
    let nextDuration = accuracyListArray[1].difference;

    let i = 0;

    while (
      absoluteDifference >= targetDuration.value &&
      nextDuration &&
      absoluteDifference < nextDuration.value &&
      i < accuracyListArray.length - 1
    ) {
      targetDuration = accuracyListArray[i].difference;
      i++;
      nextDuration = accuracyListArray[i].difference;
    }

    // console.log(targetDuration);
    // while (absoluteDifference >= targetDuration.value && i < accuracyListArray.length - 1) {
    //   targetDuration = accuracyListArray[i].difference;
    // }

    // console.log(targetDuration);

    // if (absoluteDifference < accuracyListArray[0].difference.value) {
    //   targetDuration = accuracyListArray[0].preferredAccuracy;
    // } else if (
    //   absoluteDifference > accuracyListArray[accuracyListArray.length - 1].difference.value
    // ) {
    //   targetDuration = accuracyListArray[accuracyListArray.length - 1].preferredAccuracy;
    // } else {
    //   let i = 0;
    //   targetDuration = accuracyListArray[i].difference;
    //   while (absoluteDifference < targetDuration.value && i < accuracyListArray.length) {
    //     console.log('inside', absoluteDifference, targetDuration.value);
    //     targetDuration = accuracyListArray[i].difference;
    //     i++;
    //   }
    // }

    console.log(targetDuration, absoluteDifference);
    // const accuracies = this.accuracyList.get();

    // console.log(accuracies);

    const duration = ONE_SECOND;

    return this.getOptimalDuration(duration, localAccuracyMap).context;
  }
}

export default AccuracyMap;
