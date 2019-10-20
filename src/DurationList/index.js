import { validateDurationObject } from '../utilities';

class InvalidDurationListError extends Error {}

const validateDurationsIsArray = durations => {
  if (!Array.isArray(durations)) {
    throw new InvalidDurationListError('Expected durations to be an array, but it was not.');
  }
};

const validateDurationsAreDurationsObjects = durations => {
  durations.forEach(validateDurationObject);
};

const validateDurationsAreInAscendingOrder = durations => {
  for (let i = 0; i < durations.length - 1; i++) {
    const currentDuration = durations[i];
    const nextDuration = durations[i + 1];

    if (currentDuration.value > nextDuration.value) {
      throw new InvalidDurationListError(
        'Expected input durations to be ascending order, but they were not.'
      );
    }
  }
};

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
  validateDurationsAreDurationsObjects(durations);
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
