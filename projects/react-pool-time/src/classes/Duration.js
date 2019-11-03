import React from 'react';
import { isObject } from '../utilities';

const generateTimeContextDefaultObject = duration => ({
  duration,
  registerConsumer: () => {},
  time: Date.now(),
  unregisterConsumer: () => {},
});

class InvalidDurationObjectError extends Error {}

const validateDuration = durationObject => {
  if (!isObject(durationObject)) {
    throw new InvalidDurationObjectError('Expected duration to be an object, but it was not.');
  } else if (!durationObject.key) {
    throw new InvalidDurationObjectError('Expected duration object to have a key, but it did not.');
  } else if (typeof durationObject.key !== 'string') {
    throw new InvalidDurationObjectError(
      'Expected duration object key to be a string, but it was not.'
    );
  } else if (!durationObject.value) {
    throw new InvalidDurationObjectError(
      'Expected duration object to have a value, but it did not.'
    );
  } else if (typeof durationObject.value !== 'number') {
    throw new InvalidDurationObjectError(
      'Expected duration object value to be a number, but it was not.'
    );
  }

  return durationObject;
};

class Duration {
  constructor(inputDuration) {
    const validatedInputDuration = validateDuration(inputDuration);
    const defaultContextValue = generateTimeContextDefaultObject(validatedInputDuration);
    const context = React.createContext(defaultContextValue);

    this.context = context;
    this.key = validatedInputDuration.key;
    this.value = validatedInputDuration.value;
  }
}

export default Duration;
