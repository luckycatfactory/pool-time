import AccuracyEntry from './AccuracyEntry';
import { validateArrayInAscendingOrder, validateIsArray, validateIsArrayOf } from '../utilities';

class InvalidAccuracyListInputError extends Error {}

const validateAccuraciesIsArray = validateIsArray(
  InvalidAccuracyListInputError,
  'Expected accuracy list input to be an array, but it was not.'
);

const validateIsArrayOfAccuracies = validateIsArrayOf(
  AccuracyEntry,
  InvalidAccuracyListInputError,
  'Expected accuracy list input to be an array, but it was not.'
);

const validateAccuraciesAreInAscendingOrder = validateArrayInAscendingOrder(
  element => element.difference.value,
  InvalidAccuracyListInputError,
  'Expected accuracy entries to be in ascending order, but they were not.'
);

class AccuracyList {
  constructor(accuracies) {
    validateAccuraciesIsArray(accuracies);
    const accuraciesAsEntries = accuracies.map(accuracy => new AccuracyEntry(accuracy));
    validateIsArrayOfAccuracies(accuraciesAsEntries);
    validateAccuraciesAreInAscendingOrder(accuraciesAsEntries);
    this.value = accuraciesAsEntries;
  }

  get() {
    return this.value;
  }
}

export default AccuracyList;
