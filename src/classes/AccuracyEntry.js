import Duration from './Duration';

class InvalidAccuracyEntryInputError extends Error {}

const validateSpecification = specification => {
  const { maximumAccuracy, minimumAccuracy, preferredAccuracy } = specification;
  ['difference', 'preferredAccuracy'].forEach(key => {
    if (!specification[key]) {
      throw new InvalidAccuracyEntryInputError(
        `Expected accuracy entry to have a specified ${key}, but it did not.`
      );
    }
  });

  Object.keys(specification).forEach(key => {
    if (!(specification[key] instanceof Duration)) {
      throw new InvalidAccuracyEntryInputError(
        `Expected ${key} to be a duration object, but it was not.`
      );
    }
  });

  if (maximumAccuracy && minimumAccuracy && maximumAccuracy.value > minimumAccuracy.value) {
    throw new InvalidAccuracyEntryInputError(
      'Expected the minimum accuracy duration to be greater than or equal to that of the maximum accuracy, but it was not.'
    );
  }

  if (maximumAccuracy && maximumAccuracy.value > preferredAccuracy.value) {
    throw new InvalidAccuracyEntryInputError(
      'Expected the maximum accuracy duration to be less than or equal to that of the preferred accuracy, but it was not.'
    );
  }

  if (minimumAccuracy && minimumAccuracy.value < preferredAccuracy.value) {
    throw new InvalidAccuracyEntryInputError(
      'Expected the minimum accuracy duration to be greater than or equal to that of the preferred accuracy, but it was not.'
    );
  }

  return specification;
};

class AccuracyEntry {
  constructor(specification) {
    const {
      difference,
      maximumAccuracy,
      minimumAccuracy,
      preferredAccuracy,
    } = validateSpecification(specification);
    this.difference = difference;
    this.maximumAccuracy = maximumAccuracy;
    this.minimumAccuracy = minimumAccuracy;
    this.preferredAccuracy = preferredAccuracy;
  }
}

export default AccuracyEntry;
