const validateDurationObject = durationObject => {
  if (!durationObject.key) {
    throw new Error('Expected duration object to have a key, but it did not.');
  } else if (typeof durationObject.key !== 'string') {
    throw new Error('Expected duration object key to be a string, but it was not.');
  } else if (!durationObject.value) {
    throw new Error('Expected duration object to have a value, but it did not.');
  } else if (typeof durationObject.value !== 'number') {
    throw new Error('Expected duration object value to be a number, but it was not.');
  } else if (!durationObject.context) {
    throw new Error('Expected duration object value to have a React context, but it did not.');
  }
  return durationObject;
};

export default validateDurationObject;
