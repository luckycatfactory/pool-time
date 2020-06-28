export interface BaseTimeObject {
  readonly key: string;
  readonly value: number;
}

export interface CoreAccuracyEntry<T> {
  readonly upTo: BaseTimeObject;
  readonly within: BaseTimeObject & T;
}

export interface CoreConfiguration<T> {
  readonly accuracies: CoreAccuracyEntry<T>[];
}

export interface PoolTimeOptions<T> {
  readonly configuration: CoreConfiguration<T>;
  onAccuracyEntryValidation?: (
    validatedAccuracyEntry: CoreAccuracyEntry<T>
  ) => void;
}

export interface Time {
  time: number;
  value: number;
}

type AdditionalTimeProperties<T> = Pick<T, Exclude<keyof T, BaseTimeObject>>;

export type TimeStateEntry<T extends AdditionalTimeProperties<T>> = Time & T;

interface RegistrationState {
  [withinKey: string]: number;
}

export interface TimeState<T extends AdditionalTimeProperties<T>> {
  [timeKey: string]: TimeStateEntry<T>;
}

type unsubscribeFunction = () => void;

type leastCommonDurationChangeCallback<T> = (
  duration: CoreAccuracyEntry<T>
) => void;

type tickCallback<T> = (times: TimeState<T>) => void;

export const ETERNITY: BaseTimeObject = {
  key: 'ETERNITY',
  value: Number.POSITIVE_INFINITY,
};

export function stringifyObject(object: object): string {
  return JSON.stringify(object, (key, value) =>
    key && value && typeof value !== 'number' ? '' + value : value
  );
}

function validateConfiguration<T extends AdditionalTimeProperties<T>>(
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

class PoolTime<T extends AdditionalTimeProperties<T>> {
  public configuration: CoreConfiguration<T>;

  private leastCommonDuration: CoreAccuracyEntry<T>;
  private leastCommonDurationChangeSubscriptions: leastCommonDurationChangeCallback<
    T
  >[];
  private registrations: RegistrationState;
  private times: TimeState<T>;
  private tickCallbacks: tickCallback<T>[];

  constructor({
    configuration,
    onAccuracyEntryValidation,
  }: PoolTimeOptions<T>) {
    if (process.env.NODE_ENV !== 'production') {
      validateConfiguration(configuration, onAccuracyEntryValidation);
    }
    this.configuration = configuration;
    this.leastCommonDuration = null;
    this.leastCommonDurationChangeSubscriptions = [];
    this.registrations = this.generateRegistrations();
    this.tickCallbacks = [];
    this.times = this.generateTimes();
  }

  subscribeToLeastCommonDurationChange(
    callback: (duration: CoreAccuracyEntry<T>) => void
  ): unsubscribeFunction {
    this.leastCommonDurationChangeSubscriptions.push(callback);

    return function unsubscribe(): void {
      this.leastCommonDurationChangeSubscriptions = this.leastCommonDurationChangeSubscriptions.filter(
        (registeredCallback: leastCommonDurationChangeCallback<T>) =>
          registeredCallback !== callback
      );
    }.bind(this);
  }

  subscribeToTick(callback: tickCallback<T>): unsubscribeFunction {
    this.tickCallbacks.push(callback);

    return function unsubscribe(): void {
      this.tickCallbacks = this.tickCallbacks.filter(
        (registeredCallback: tickCallback<T>) => registeredCallback !== callback
      );
    }.bind(this);
  }

  getTimes(): TimeState<T> {
    return this.times;
  }

  register(timeKey: string): unsubscribeFunction {
    const previousNumberOfRegistrations = this.registrations[timeKey];
    this.registrations[timeKey] = previousNumberOfRegistrations + 1;
    this.handleRegistrationChange(previousNumberOfRegistrations);

    return function unregister(): void {
      const nextNumberOfRegistrations = this.registrations[timeKey] - 1;
      this.registrations[timeKey] = nextNumberOfRegistrations;
      this.handleRegistrationChange(previousNumberOfRegistrations);
    }.bind(this);
  }

  startTicking(): unsubscribeFunction {
    if (!this.leastCommonDuration) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          "The pool-time instance can not be started when there are no registrations. This is likely an issue with the implementation of pool-time that you're using."
        );
      }

      return function unsubscribe(): void {
        // For consistency we return an unsubscribe, but this is no-op.
      }.bind(this);
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const { nextTimes } = this.configuration.accuracies.reduce<{
        hasShortCircuited: boolean;
        nextTimes: TimeState<T>;
      }>(
        (acc, { within }) => {
          if (acc.hasShortCircuited) {
            acc.nextTimes[within.key] = this.times[within.key];
            return acc;
          }
          const previousTimes = this.times[within.key].time;
          const timeSinceLastUpdate = now - previousTimes;

          if (timeSinceLastUpdate >= within.value) {
            acc.nextTimes[within.key] = {
              ...within,
              time: now,
              value: within.value,
            };
          } else {
            acc.nextTimes[within.key] = this.times[within.key];
            acc.hasShortCircuited = true;
          }
          return acc;
        },
        { hasShortCircuited: false, nextTimes: {} }
      );
      this.times = nextTimes;
      this.emitTick(this.times);
    }, this.leastCommonDuration.within.value);

    return function unsubscribe(): void {
      clearInterval(intervalId);
    }.bind(this);
  }

  private emitLeastCommonDurationChange(
    leastCommonDuration: CoreAccuracyEntry<T>
  ): void {
    this.leastCommonDurationChangeSubscriptions.forEach((callback) =>
      callback(leastCommonDuration)
    );
  }

  private emitTick(times: TimeState<T>): void {
    this.tickCallbacks.forEach((callback) => callback(times));
  }

  private findLeastCommonDuration(): CoreAccuracyEntry<T> {
    const leastCommonDuration =
      this.configuration.accuracies.find((accuracyEntry) =>
        Boolean(this.registrations[accuracyEntry.within.key])
      ) || null;

    return leastCommonDuration;
  }

  private generateRegistrations(): RegistrationState {
    return this.configuration.accuracies.reduce<RegistrationState>(
      (acc, { within: { key } }) => {
        acc[key] = 0;
        return acc;
      },
      {}
    );
  }

  private generateTimes(): TimeState<T> {
    return this.configuration.accuracies.reduce<TimeState<T>>(
      (accumulator, { within }) => {
        accumulator[within.key] = {
          ...within,
          time: Date.now(),
          value: within.value,
        };
        return accumulator;
      },
      {}
    );
  }

  private handleRegistrationChange(
    applicableNumberOfRegistrations: number
  ): void {
    if (applicableNumberOfRegistrations === 0) {
      const currentLeastCommonDuration = this.leastCommonDuration;
      const nextLeastCommonDuration = this.findLeastCommonDuration();

      if (nextLeastCommonDuration !== currentLeastCommonDuration) {
        this.leastCommonDuration = nextLeastCommonDuration;
        this.emitLeastCommonDurationChange(this.leastCommonDuration);
        this.tickLeastCommonDuration();
      }
    }
  }

  private tickLeastCommonDuration(): void {
    if (!this.leastCommonDuration) return;
    const {
      within: { key },
    } = this.leastCommonDuration;
    this.times = {
      ...this.times,
      [key]: {
        ...this.times[key],
        time: Date.now(),
      },
    };
    this.emitTick(this.times);
  }
}

export default PoolTime;
