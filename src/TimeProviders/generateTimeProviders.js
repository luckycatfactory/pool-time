import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import DurationsContext from './DurationsContext';
import GlobalAccuracyContext from './GlobalAccuracyContext';
import DurationList from '../DurationList';
import AccuracyMap from '../AccuracyMap';
import { getDateNow, useInterval } from '../utilities';

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

const generateTimeProviders = (inputDurations, globalAccuracy) => {
  const durationList = new DurationList(inputDurations);
  const durations = durationList.get();
  const globalAccuracyMap = new AccuracyMap(durationList, globalAccuracy);

  const TimeProviders = React.memo(({ children, onIntervalUpdate, onRegistrationsUpdate }) => {
    // For consistency, we prefer to always ensure that all "now" references are the same in a single
    // render.
    const nowOnInitialRendering = useRef(getDateNow());
    const [currentTimes, setCurrentTimes] = useState(
      createInitialStateObject(durations, nowOnInitialRendering.current)
    );
    const [consumerRegistrations, setConsumerRegistrations] = useState(
      createInitialStateObject(durations, 0)
    );

    const intervalToUse = useMemo(
      () => getIntervalToUse(durations, consumerRegistrations, globalAccuracy),
      [consumerRegistrations]
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
        const currentDuration = durations[durationIndex];
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

          if (durationIndex >= durations.length) {
            keepGoing = false;
          }
        } else {
          keepGoing = false;
        }
      }
    }, intervalToUse);

    const materializedValues = durations.reduce((acc, duration) => {
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

      for (let i = 0; i < durations.length; i++) {
        const duration = durations[i];

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
      <DurationsContext.Provider value={durations}>
        <GlobalAccuracyContext.Provider value={globalAccuracyMap}>
          {renderProviders()}
        </GlobalAccuracyContext.Provider>
      </DurationsContext.Provider>
    );
  });

  TimeProviders.displayName = 'TimeProviders';

  TimeProviders.propTypes = {
    children: PropTypes.node.isRequired,
    onIntervalUpdate: PropTypes.func,
    onRegistrationsUpdate: PropTypes.func,
  };

  TimeProviders.defaultProps = {
    onIntervalUpdate: () => {},
    onRegistrationsUpdate: () => {},
  };

  return TimeProviders;
};

export default generateTimeProviders;
