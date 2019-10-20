import isObject from './isObject';
import validateDurationObject from './validateDurationObject';

class InvalidAccuracyObjectError extends Error {}

const validateAccuracyObject = object => {
  if (!isObject(object)) {
    throw new InvalidAccuracyObjectError(
      'Expected accuracy entry to be an object, but it was not.'
    );
  }

  if (!object.difference || !isObject(object.difference)) {
    throw new InvalidAccuracyObjectError(
      'Expected accuracy object to have a difference object, but it did not.'
    );
  }

  try {
    validateDurationObject(object.difference);
  } catch (error) {
    throw new InvalidAccuracyObjectError(
      `Expected accuracy object to have a valid duration object, but it did not. Received the following error: ${error.message}`
    );
  }
};

export default validateAccuracyObject;
