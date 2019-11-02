import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import DurationsContext from './DurationsContext';
import GlobalAccuracyContext from './GlobalAccuracyContext';
import DurationList from '../classes/DurationList';
import AccuracyMap from '../classes/AccuracyMap';
import AccuracyList from '../classes/AccuracyList';
import { getDateNow, useInterval } from '../utilities';

// TODO: Should this always be max?
const getIntervalToUseOrMinimalAcceptable = (targetDuration, globalAccuracy) =>
  Math.max(targetDuration.value, globalAccuracy.value);

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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useCallback(generateConsumerRegistrationIncrementer(setConsumerRegistrations, key), []),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useCallback(generateConsumerRegistrationDecrementer(setConsumerRegistrations, key), []),
];

const generateValueObject = (duration, registerConsumer, time, unregisterConsumer) =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMemo(
    () => ({
      duration,
      registerConsumer,
      time,
      unregisterConsumer,
    }),
    [duration, registerConsumer, time, unregisterConsumer]
  );

const createInitialStateObject = (durations, seedValue) =>
  durations.reduce((acc, duration) => Object.assign(acc, { [duration.key]: seedValue }), {});

const getIntervalToUse = (durations, consumerRegistrations, globalAccuracy) => {
  let mostRecentGlobalAccuracySetting = globalAccuracy[0];
  for (let i = 0; i < durations.length; i++) {
    const duration = durations[i];
    if (globalAccuracy[i] && globalAccuracy[i].difference === duration) {
      mostRecentGlobalAccuracySetting = globalAccuracy[i];
    }
    if (consumerRegistrations[duration.key]) {
      console.log('hit this for some reason', consumerRegistrations, duration);
      return getIntervalToUseOrMinimalAcceptable(
        duration,
        mostRecentGlobalAccuracySetting.preferredAccuracy
      );
    }
  }

  return null;
};

const generateTimeProviders = (inputDurations, globalAccuracy) => {
  const durations = new DurationList(inputDurations);
  const durationsAsArray = durations.get();
  const accuracies = new AccuracyList(globalAccuracy);
  const globalAccuracyMap = new AccuracyMap(durations, accuracies);

  const TimeProviders = React.memo(({ children, onIntervalUpdate, onRegistrationsUpdate }) => {
    // For consistency, we prefer to always ensure that all "now" references are the same in a single
    // render.
    const nowOnInitialRendering = useRef(getDateNow());
    const [currentTimes, setCurrentTimes] = useState(
      createInitialStateObject(durationsAsArray, nowOnInitialRendering.current)
    );
    const [consumerRegistrations, setConsumerRegistrations] = useState(
      createInitialStateObject(durationsAsArray, 0)
    );

    const intervalToUse = useMemo(
      () => getIntervalToUse(durationsAsArray, consumerRegistrations, globalAccuracy),
      [consumerRegistrations]
    );

    useEffect(() => {
      console.log('updated!!!', intervalToUse);
      onIntervalUpdate(intervalToUse);
    }, [intervalToUse, onIntervalUpdate]);

    useEffect(() => {
      onRegistrationsUpdate(consumerRegistrations);
    }, [consumerRegistrations, onRegistrationsUpdate]);

    useInterval(() => {
      console.log(consumerRegistrations);
      const now = getDateNow();

      let durationIndex = 0;
      let keepGoing = true;

      while (keepGoing) {
        const currentDuration = durationsAsArray[durationIndex];
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

          if (!(durationIndex < durationsAsArray.length)) {
            keepGoing = false;
          }
        } else {
          keepGoing = false;
        }
      }
    }, intervalToUse);

    const materializedValues = durationsAsArray.reduce((accumulator, duration) => {
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

      accumulator[duration.key] = value;

      return accumulator;
    }, {});

    const renderProviders = () => {
      let rendering = children;

      for (let i = 0; i < durationsAsArray.length; i++) {
        const duration = durationsAsArray[i];

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
