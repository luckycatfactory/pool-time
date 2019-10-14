import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import GlobalMinimumAccuracyContext from './GlobalMinimumAccuracyContext';
import useInterval from '../utilities/useInterval';
import { getDateNow, validateDurationObject } from '../utilities';

const getIntervalToUseOrMinimalAcceptable = (targetDuration, globalMinimumAccuracy) =>
  Math.min(targetDuration.value, globalMinimumAccuracy.value);

const generateConsumerRegistrationIncrementer = (setConsumerRegistrations, key) => () =>
  setConsumerRegistrations(previousRegistrations => ({
    ...previousRegistrations,
    [key]: previousRegistrations[key] + 1,
  }));
const generateConsumerRegistrationDecrementer = (setConsumerRegistrations, key) => () =>
  setConsumerRegistrations(previousRegistrations => ({
    ...previousRegistrations,
    [key]: previousRegistrations[key] - 1,
  }));
const generateRegistrationFunctions = (setConsumerRegistrations, key) => [
  useCallback(generateConsumerRegistrationIncrementer(setConsumerRegistrations, key), []),
  useCallback(generateConsumerRegistrationDecrementer(setConsumerRegistrations, key), []),
];

const generateValueObject = (duration, registerConsumer, time, unregisterConsumer) =>
  useMemo(
    () => ({
      duration,
      registerConsumer,
      time,
      unregisterConsumer,
    }),
    [time]
  );

const createInitialStateObject = (durations, seedValue) =>
  durations.reduce((acc, duration) => Object.assign(acc, { [duration.key]: seedValue }), {});

const getIntervalToUse = (durations, consumerRegistrations, validatedGlobalMinimumAccuracy) => {
  for (let i = 0; i < durations.length; i++) {
    const duration = durations[i];
    if (consumerRegistrations[duration.key]) {
      return getIntervalToUseOrMinimalAcceptable(duration, validatedGlobalMinimumAccuracy);
    }
  }

  return null;
};

const validateDurationsInAscendingOrder = durations => {
  for (let i = 0; i < durations.length - 1; i++) {
    if (durations[i].value > durations[i + 1].value) {
      throw new Error('Expected durations to be in ascending order, but they were not.');
    }
  }
  return durations;
};

const validateDurationsUniqueness = (durations, durationsSet) => {
  if (durations.length !== durationsSet.size) {
    throw new Error('Expected durations to be unique, but they were not.');
  }
  return durations;
};

const generateTimeProviders = (inputDurations = [], defaultGlobalMinimumAccuracy) => {
  const durationsSet = new Set(inputDurations);
  const validateGlobalMinimumAccuracy = globalMinimumAccuracy => {
    if (!durationsSet.has(globalMinimumAccuracy)) {
      throw new Error('globalMinimumAccuracy must be a valid duration');
    }
    return globalMinimumAccuracy;
  };

  const validatedInputDurations = validateDurationsUniqueness(
    validateDurationsInAscendingOrder(inputDurations.map(validateDurationObject)),
    durationsSet
  );

  const TimeProviders = React.memo(
    ({ children, globalMinimumAccuracy, onIntervalUpdate, onRegistrationsUpdate }) => {
      const durations = useRef(validatedInputDurations);
      // For consistency, we prefer to always ensure that all "now" references are the same in a single
      // render.
      const nowOnInitialRendering = useRef(getDateNow());
      const [currentTimes, setCurrentTimes] = useState(
        createInitialStateObject(durations.current, nowOnInitialRendering.current)
      );
      const [consumerRegistrations, setConsumerRegistrations] = useState(
        createInitialStateObject(durations.current, 0)
      );

      const validatedGlobalMinimumAccuracy = useMemo(
        () => validateGlobalMinimumAccuracy(globalMinimumAccuracy),
        [globalMinimumAccuracy]
      );

      const intervalToUse = useMemo(
        () =>
          getIntervalToUse(
            durations.current,
            consumerRegistrations,
            validatedGlobalMinimumAccuracy
          ),
        [consumerRegistrations, validatedGlobalMinimumAccuracy]
      );

      useEffect(() => {
        onIntervalUpdate(intervalToUse);
      }, [intervalToUse, onIntervalUpdate]);

      useEffect(() => {
        onRegistrationsUpdate(consumerRegistrations);
      }, [consumerRegistrations, onRegistrationsUpdate]);

      useInterval(() => {
        const now = getDateNow();

        let durationIndex = 0;
        let keepGoing = true;

        while (keepGoing) {
          const currentDuration = durations.current[durationIndex];
          const previousValueAtScale = Math.floor(
            currentTimes[currentDuration.key] / currentDuration.value
          );
          const thisValueAtScale = Math.floor(now / currentDuration.value);

          if (previousValueAtScale !== thisValueAtScale) {
            setCurrentTimes(previousTimes => ({
              ...previousTimes,
              [currentDuration.key]: now,
            }));
            durationIndex = durationIndex + 1;

            if (durationIndex >= durations.current.length) {
              keepGoing = false;
            }
          } else {
            keepGoing = false;
          }
        }
      }, intervalToUse);

      const materializedValues = durations.current.reduce((acc, duration) => {
        const [registerConsumer, unregisterConsumer] = generateRegistrationFunctions(
          setConsumerRegistrations,
          duration.key
        );
        const value = generateValueObject(
          duration.value,
          registerConsumer,
          currentTimes[duration.key],
          unregisterConsumer
        );

        acc[duration.key] = value;

        return acc;
      }, {});

      const renderProviders = () => {
        let rendering = children;

        for (let i = 0; i < durations.current.length; i++) {
          const duration = durations.current[i];

          const nextRendering = (
            <duration.context.Provider value={materializedValues[duration.key]}>
              {rendering}
            </duration.context.Provider>
          );

          rendering = nextRendering;
        }

        return rendering;
      };

      return (
        <GlobalMinimumAccuracyContext.Provider value={validatedGlobalMinimumAccuracy}>
          {renderProviders()}
        </GlobalMinimumAccuracyContext.Provider>
      );
    }
  );

  TimeProviders.displayName = 'TimeProviders';

  TimeProviders.propTypes = {
    children: PropTypes.node.isRequired,
    globalMinimumAccuracy: PropTypes.exact({
      context: PropTypes.object.isRequired,
      key: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
    onIntervalUpdate: PropTypes.func,
    onRegistrationsUpdate: PropTypes.func,
  };

  TimeProviders.defaultProps = {
    globalMinimumAccuracy: defaultGlobalMinimumAccuracy,
    onIntervalUpdate: () => {},
    onRegistrationsUpdate: () => {},
  };

  return TimeProviders;
};

export default generateTimeProviders;
