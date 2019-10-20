import { validateAccuracyObject } from '../utilities';

class InvalidAccuracyInputError extends Error {}

const useValidatedAccuracy = accuracy => {
  if (!Array.isArray(accuracy)) {
    throw new InvalidAccuracyInputError('Expected accuracy to be an array, but it was not.');
  }

  accuracy.forEach(validateAccuracyObject);

  return accuracy;
};

export default useValidatedAccuracy;
