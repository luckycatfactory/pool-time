import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import DayContext from './DayContext';
import GlobalMinimumAccuracyContext from './GlobalMinimumAccuracyContext';
import HourContext from './HourContext';
import MinuteContext from './MinuteContext';
import MonthContext from './MonthContext';
import SecondContext from './SecondContext';
import YearContext from './YearContext';
import useInterval from '../useInterval';
import { ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY, ONE_MONTH, ONE_YEAR } from '../durations';
import { getDateNow } from '../utilities';

const durationSet = new Set([ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR]);
const validateGlobalMinimumAccuracy = globalMinimumAccuracy => {
  if (!durationSet.has(globalMinimumAccuracy)) {
    throw new Error('globalMinimumAccuracy must be a valid duration');
  }
  return globalMinimumAccuracy;
};

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

const createInitialStateObject = seedTime => ({
  [ONE_SECOND.key]: seedTime,
  [ONE_MINUTE.key]: seedTime,
  [ONE_HOUR.key]: seedTime,
  [ONE_DAY.key]: seedTime,
  [ONE_MONTH.key]: seedTime,
  [ONE_YEAR.key]: seedTime,
});

const DURATIONS_IN_ASCENDING_ORDER = [ONE_MINUTE, ONE_HOUR, ONE_DAY, ONE_MONTH, ONE_YEAR];

const TimeProviders = React.memo(
  ({ children, globalMinimumAccuracy, onIntervalUpdate, onRegistrationsUpdate }) => {
    // For consistency, we prefer to always ensure that all "now" references are the same in a single
    // render.
    const nowOnInitialRendering = useRef(getDateNow());
    const [currentTimes, setCurrentTimes] = useState(
      createInitialStateObject(nowOnInitialRendering.current)
    );
    const [consumerRegistrations, setConsumerRegistrations] = useState(createInitialStateObject(0));

    const vaildatedGlobalMinimumAccuracy = useMemo(
      () => validateGlobalMinimumAccuracy(globalMinimumAccuracy),
      [globalMinimumAccuracy]
    );

    const intervalToUse = useMemo(() => {
      // Good opportunity to DRY things up.
      if (consumerRegistrations[ONE_SECOND.key]) {
        return getIntervalToUseOrMinimalAcceptable(ONE_SECOND, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations[ONE_MINUTE.key]) {
        return getIntervalToUseOrMinimalAcceptable(ONE_MINUTE, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations[ONE_HOUR.key]) {
        return getIntervalToUseOrMinimalAcceptable(ONE_HOUR, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations[ONE_DAY.key]) {
        return getIntervalToUseOrMinimalAcceptable(ONE_DAY, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations[ONE_MONTH.key]) {
        return getIntervalToUseOrMinimalAcceptable(ONE_MONTH, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations[ONE_YEAR.key]) {
        return getIntervalToUseOrMinimalAcceptable(ONE_YEAR, vaildatedGlobalMinimumAccuracy);
      } else {
        return null;
      }
    }, [consumerRegistrations, vaildatedGlobalMinimumAccuracy]);

    useEffect(() => {
      onIntervalUpdate(intervalToUse);
    }, [intervalToUse, onIntervalUpdate]);

    useEffect(() => {
      onRegistrationsUpdate(consumerRegistrations);
    }, [consumerRegistrations, onRegistrationsUpdate]);

    useInterval(() => {
      const now = getDateNow();
      setCurrentTimes(previousTimes => ({
        ...previousTimes,
        [ONE_SECOND.key]: now,
      }));

      let durationIndex = 0;
      let keepGoing = true;

      while (keepGoing) {
        const currentDuration = DURATIONS_IN_ASCENDING_ORDER[durationIndex];
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

          if (durationIndex >= DURATIONS_IN_ASCENDING_ORDER.length) {
            keepGoing = false;
          }
        } else {
          keepGoing = false;
        }
      }
    }, intervalToUse);

    const [registerYearConsumer, unregisterYearConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      ONE_YEAR.key
    );
    const [registerMonthConsumer, unregisterMonthConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      ONE_MONTH.key
    );
    const [registerDayConsumer, unregisterDayConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      ONE_DAY.key
    );
    const [registerHourConsumer, unregisterHourConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      ONE_HOUR.key
    );
    const [registerMinuteConsumer, unregisterMinuteConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      ONE_MINUTE.key
    );
    const [registerSecondConsumer, unregisterSecondConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      ONE_SECOND.key
    );

    const yearValue = generateValueObject(
      ONE_YEAR.value,
      registerYearConsumer,
      currentTimes[ONE_YEAR.key],
      unregisterYearConsumer
    );
    const monthValue = generateValueObject(
      ONE_MONTH.value,
      registerMonthConsumer,
      currentTimes[ONE_MONTH.key],
      unregisterMonthConsumer
    );
    const dayValue = generateValueObject(
      ONE_DAY.value,
      registerDayConsumer,
      currentTimes[ONE_DAY.key],
      unregisterDayConsumer
    );
    const hourValue = generateValueObject(
      ONE_HOUR.value,
      registerHourConsumer,
      currentTimes[ONE_HOUR.key],
      unregisterHourConsumer
    );
    const minuteValue = generateValueObject(
      ONE_MINUTE.value,
      registerMinuteConsumer,
      currentTimes[ONE_MINUTE.key],
      unregisterMinuteConsumer
    );
    const secondValue = generateValueObject(
      ONE_SECOND.value,
      registerSecondConsumer,
      currentTimes[ONE_SECOND.key],
      unregisterSecondConsumer
    );

    return (
      <GlobalMinimumAccuracyContext.Provider value={vaildatedGlobalMinimumAccuracy}>
        <YearContext.Provider value={yearValue}>
          <MonthContext.Provider value={monthValue}>
            <DayContext.Provider value={dayValue}>
              <HourContext.Provider value={hourValue}>
                <MinuteContext.Provider value={minuteValue}>
                  <SecondContext.Provider value={secondValue}>{children}</SecondContext.Provider>
                </MinuteContext.Provider>
              </HourContext.Provider>
            </DayContext.Provider>
          </MonthContext.Provider>
        </YearContext.Provider>
      </GlobalMinimumAccuracyContext.Provider>
    );
  }
);

TimeProviders.displayName = 'TimeProviders';

TimeProviders.propTypes = {
  children: PropTypes.node.isRequired,
  globalMinimumAccuracy: PropTypes.oneOf([
    ONE_SECOND,
    ONE_MINUTE,
    ONE_HOUR,
    ONE_DAY,
    ONE_MONTH,
    ONE_YEAR,
  ]),
  onIntervalUpdate: PropTypes.func,
  onRegistrationsUpdate: PropTypes.func,
};

TimeProviders.defaultProps = {
  globalMinimumAccuracy: ONE_MINUTE,
  onIntervalUpdate: () => {},
  onRegistrationsUpdate: () => {},
};

export default TimeProviders;
