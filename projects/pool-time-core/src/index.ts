export interface BaseTimeObject {
  readonly key: string;
  readonly value: number;
}

export interface CoreAccuracyEntry<T extends BaseTimeObject> {
  readonly upTo: BaseTimeObject;
  readonly within: T;
}

export interface CoreConfiguration<T extends BaseTimeObject> {
  readonly accuracies: CoreAccuracyEntry<T>[];
}

export const ETERNITY: BaseTimeObject = {
  key: 'ETERNITY',
  value: Number.POSITIVE_INFINITY,
};

export interface PoolTimeOptions<T extends BaseTimeObject> {
  readonly configuration: CoreConfiguration<T>;
  onAccuracyEntryValidation?: (
    validatedAccuracyEntry: CoreAccuracyEntry<T>
  ) => void;
}

export function stringifyObject(object: object): string {
  return JSON.stringify(object, (key, value) =>
    key && value && typeof value !== 'number' ? '' + value : value
  );
}

function validateConfiguration<T extends BaseTimeObject>(
  configuration: CoreConfiguration<T>,
  onAccuracyEntryValidation: (
    validatedAccuracyEntry: CoreAccuracyEntry<T>
  ) => void
): void {
  if (!configuration.accuracies) {
    throw new Error(
      'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not present.'
    );
  }
  if (!Array.isArray(configuration.accuracies)) {
    throw new Error(
      'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was not an array.'
    );
  }
  if (configuration.accuracies.length === 0) {
    throw new Error(
      'Invalid configuration object passed to createPoolTimeProvider. Expected "accuracies" property to be a non-empty array, but it was an empty array.'
    );
  }
  const requiredAccuracyEntryKeys = new Set(['upTo', 'within']);
  const invalidAccuracyEntry = configuration.accuracies.find(
    (accuracyEntry) => {
      const keys = Object.keys(accuracyEntry);
      if (
        keys.length !== requiredAccuracyEntryKeys.size ||
        keys.some((key) => !requiredAccuracyEntryKeys.has(key))
      ) {
        return true;
      }
    }
  );

  if (invalidAccuracyEntry) {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Expected accuracy entry to have keys for "upTo" and "within" with time objects as values, but instead received: ${stringifyObject(
        invalidAccuracyEntry
      )}.`
    );
  }
  const isInvalidTimeObject = (timeObject: BaseTimeObject): boolean =>
    timeObject !== ETERNITY && (!timeObject.key || !timeObject.value);
  const invalidUpToTimeObject = configuration.accuracies
    .map(({ upTo }) => upTo)
    .find(isInvalidTimeObject);
  const throwInvalidTimeObjectError = (
    invalidTimeObject: BaseTimeObject
  ): void => {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Expected time object to have a key and value, but instead received: ${stringifyObject(
        invalidTimeObject
      )}.`
    );
  };
  if (invalidUpToTimeObject) throwInvalidTimeObjectError(invalidUpToTimeObject);
  const invalidWithinTimeObject = configuration.accuracies
    .map(({ within }) => within)
    .find(isInvalidTimeObject);
  if (invalidWithinTimeObject)
    throwInvalidTimeObjectError(invalidWithinTimeObject);

  const upToValues = new Set();
  const duplicateUpToValue = configuration.accuracies.find(({ upTo }) => {
    if (upToValues.has(upTo.key)) return true;

    upToValues.add(upTo.key);

    return false;
  });

  if (duplicateUpToValue) {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Expected all accuracy entries to have unique upTo time values, but found duplicate entry on ${duplicateUpToValue.upTo.key}.`
    );
  }

  const withinValues = new Set();
  const duplicateWithinValue = configuration.accuracies.find(({ within }) => {
    if (withinValues.has(within.key)) return true;

    withinValues.add(within.key);

    return false;
  });

  if (duplicateWithinValue) {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Expected all accuracy entries to have unique within time values, but found duplicate entry on ${duplicateWithinValue.within.key}.`
    );
  }

  const unsortedUpToValueIndex = configuration.accuracies
    .slice(1)
    .findIndex(
      ({ upTo }, index) =>
        configuration.accuracies[index].upTo.value >= upTo.value
    );

  if (unsortedUpToValueIndex !== -1) {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Accuracies must be sorted such that every upTo is greater than the upTo of the previous entry. Found ${
        configuration.accuracies[unsortedUpToValueIndex].upTo.key
      } placed before ${
        configuration.accuracies[unsortedUpToValueIndex + 1].upTo.key
      }.`
    );
  }

  const unsortedWithinValueIndex = configuration.accuracies
    .slice(1)
    .findIndex(
      ({ within }, index) =>
        configuration.accuracies[index].within.value >= within.value
    );

  if (unsortedWithinValueIndex !== -1) {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Accuracies must be sorted such that every within is greater than the within of the previous entry. Found ${
        configuration.accuracies[unsortedWithinValueIndex].within.key
      } placed before ${
        configuration.accuracies[unsortedWithinValueIndex + 1].within.key
      }.`
    );
  }

  const nonsenseAccuracyEntry = configuration.accuracies.find(
    ({ upTo, within }) => upTo.value < within.value
  );

  if (nonsenseAccuracyEntry) {
    throw new Error(
      `Invalid configuration object passed to createPoolTimeProvider. Accuracy entries must always have within values that are less than or equal to their own upTo values. Found an entry with an upTo of ${nonsenseAccuracyEntry.upTo.key} that had a within of ${nonsenseAccuracyEntry.within.key}.`
    );
  }

  if (
    configuration.accuracies[configuration.accuracies.length - 1].upTo !==
    ETERNITY
  ) {
    throw new Error(
      'Invalid configuration object passed to createPoolTimeProvider. Accuracy lists must terminate with an entry with an upTo of ETERNITY.'
    );
  }

  if (onAccuracyEntryValidation) {
    configuration.accuracies.forEach((accuracyEntry) =>
      onAccuracyEntryValidation(accuracyEntry)
    );
  }
}

class PoolTime<T extends BaseTimeObject> {
  public configuration: CoreConfiguration<T>;

  constructor({
    configuration,
    onAccuracyEntryValidation,
  }: PoolTimeOptions<T>) {
    if (process.env.NODE_ENV !== 'production') {
      validateConfiguration(configuration, onAccuracyEntryValidation);
    }
    this.configuration = configuration;
  }
}

export default PoolTime;
