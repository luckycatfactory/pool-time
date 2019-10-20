import DurationList from '../DurationList';
import { validateAccuracyObject } from '../utilities';

class InvalidAccuracyMapInputError extends Error {}

const validateDurationsIsDurationList = durations => {
  if (!(durations instanceof DurationList)) {
    throw new InvalidAccuracyMapInputError(
      'Expected durations to be a DurationList, but it was not.'
    );
  }
};

const validateDurations = durations => {
  validateDurationsIsDurationList(durations);

  return durations;
};

const validateAccuracyListIsArray = accuracyList => {
  if (!Array.isArray(accuracyList)) {
    throw new InvalidAccuracyMapInputError(
      'Expected accuracy specification to be an array, but it was not.'
    );
  }
};

const validateAccuracyListObjects = accuracyList => {
  accuracyList.forEach(validateAccuracyObject);
};

const validateAccuracyListIsInAscendingOrder = accuracyList => {
  for (let i = 0; i < accuracyList.length - 1; i++) {
    const currentAccuracy = accuracyList[i];
    const nextAccuracy = accuracyList[i + 1];

    if (currentAccuracy.difference.value > nextAccuracy.difference.value) {
      throw new InvalidAccuracyMapInputError(
        'Expected accuracy specification to be in ascending order by difference, but it was not.'
      );
    }
  }
};

const validateAccuracyList = accuracyList => {
  validateAccuracyListIsArray(accuracyList);
  validateAccuracyListObjects(accuracyList);
  validateAccuracyListIsInAscendingOrder(accuracyList);

  return accuracyList;
};

const validateAccuracyListStartsWithSmallestDuration = (durationList, accuracyList) => {
  const smallestDuration = durationList.get()[0];
  if (accuracyList[0].difference !== smallestDuration) {
    throw new Error(
      'Accuracy specifications must begin with the shortest duration passed to the TimeProviders.'
    );
  }
};

const makeAccuracyListIntoObject = (durationList, accuracyList) => {
  // if the smallest duration is not in the global accuracy list, fail.
  const durations = durationList.get();
  let currentDurationIndex = 0;

  accuracyList.reduce((accumulator, accuracyObject) => {
    const currentDuration = durations[currentDurationIndex];

    if (accuracyObject.difference === currentDuration) {
      // In this case, there is an explicit setting for differences of this duration.
      accumulator[currentDuration.key] = accuracyObject;
      currentDurationIndex++;
    } else {
      accumulator[currentDuration.key] = accuracyObject;
    }

    return accumulator;
  }, {});
};

class AccuracyMap {
  constructor(durations, accuracyList) {
    const validatedDurations = validateDurations(durations);
    const validatedAccuracyList = validateAccuracyList(accuracyList);
    validateAccuracyListStartsWithSmallestDuration(validatedDurations, validatedAccuracyList);
    this.value = makeAccuracyListIntoObject(validatedDurations, validatedAccuracyList);
  }

  get() {
    return this.value;
  }
}

export default AccuracyMap;
