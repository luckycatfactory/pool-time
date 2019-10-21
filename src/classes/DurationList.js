import Duration from './Duration';
import { validateArrayInAscendingOrder, validateIsArray, validateIsArrayOf } from '../utilities';

class InvalidDurationListError extends Error {}

const validateDurationsIsArray = validateIsArray(
  InvalidDurationListError,
  'Expected durations to be an array, but it was not.'
);

const validateDurationsAreDurationInstances = validateIsArrayOf(
  Duration,
  InvalidDurationListError,
  'Expected all durations to be duration instances, but they were not.'
);

const validateDurationsAreInAscendingOrder = validateArrayInAscendingOrder(
  element => element.value,
  InvalidDurationListError,
  'Expected input durations to be ascending order, but they were not.'
);

const validateDurationsAreUnique = durations => {
  const durationsObject = durations.reduce((acc, duration) => {
    acc[duration.value] = true;
    return acc;
  }, {});

  if (Object.keys(durationsObject).length !== durations.length) {
    throw new InvalidDurationListError(
      'Expected all input durations to be unique, but they were not.'
    );
  }
};

const validateDurations = durations => {
  validateDurationsIsArray(durations);
  validateDurationsAreDurationInstances(durations);
  validateDurationsAreInAscendingOrder(durations);
  validateDurationsAreUnique(durations);

  return durations;
};

class DurationList {
  constructor(durations) {
    this.value = validateDurations(durations);
  }

  get() {
    return this.value;
  }
}

export default DurationList;
