import isObject from './isObject';

class InvalidDurationObjectError extends Error {}

const validateDurationObject = durationObject => {
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
  } else if (!durationObject.context) {
    throw new InvalidDurationObjectError(
      'Expected duration object to have a React context, but it did not.'
    );
  }
  return durationObject;
};

export default validateDurationObject;
