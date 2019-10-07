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
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from '../constants';

const durationSet = new Set([ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR]);
const validateGlobalMinimumAccuracy = globalMinimumAccuracy => {
  if (!durationSet.has(globalMinimumAccuracy)) {
    throw new Error('globalMinimumAccuracy must be a valid duration.');
  }
  return globalMinimumAccuracy;
};

const getIntervalToUseOrMinimumallyAccepted = (targetDuration, globalMinimumAccuracy) =>
  Math.min(targetDuration, globalMinimumAccuracy);

const generateConsumerRegistrationIncrementer = (setConsumerRegistration, key) => () =>
  setConsumerRegistration(previousRegistrations => ({
    ...previousRegistrations,
    [key]: previousRegistrations[key] + 1,
  }));
const generateConsumerRegistrationDecrementer = (setConsumerRegistration, key) => () =>
  setConsumerRegistration(previousRegistrations => ({
    ...previousRegistrations,
    [key]: previousRegistrations[key] - 1,
  }));
const generateRegistrationFunctions = (setConsumerRegistrations, key) => [
  useCallback(generateConsumerRegistrationIncrementer(setConsumerRegistrations, key), []),
  useCallback(generateConsumerRegistrationDecrementer(setConsumerRegistrations, key), []),
];

const generateValueObject = (registerConsumer, scale, time, unregisterConsumer) =>
  useMemo(
    () => ({
      registerConsumer,
      scale,
      time,
      unregisterConsumer,
    }),
    [time]
  );

const createInitialStateObject = seed => ({
  day: seed,
  hour: seed,
  minute: seed,
  month: seed,
  second: seed,
  year: seed,
});

const TimeProviders = React.memo(
  ({ children, globalMinimumAccuracy, onIntervalUpdate, onRegistrationsUpdate }) => {
    // For consistency, we prefer to always ensure that all "now" references are the same in a single
    // render.
    const nowOnInitialRendering = useRef(Date.now());
    const [currentTimes, setCurrentTimes] = useState(
      createInitialStateObject(nowOnInitialRendering.current)
    );
    const [consumerRegistrations, setConsumerRegistrations] = useState(createInitialStateObject(0));

    const vaildatedGlobalMinimumAccuracy = useMemo(
      () => validateGlobalMinimumAccuracy(globalMinimumAccuracy),
      [globalMinimumAccuracy]
    );

    const intervalToUse = useMemo(() => {
      if (consumerRegistrations.second) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_SECOND, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations.minute) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_MINUTE, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations.hour) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_HOUR, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations.day) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_DAY, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations.month) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_MONTH, vaildatedGlobalMinimumAccuracy);
      } else if (consumerRegistrations.year) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_YEAR, vaildatedGlobalMinimumAccuracy);
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

    const scaleSequence = useMemo(
      () => [
        [ONE_MINUTE, currentTimes.minute, 'minute'],
        [ONE_HOUR, currentTimes.hour, 'hour'],
        [ONE_DAY, currentTimes.day, 'day'],
        [ONE_MONTH, currentTimes.month, 'month'],
        [ONE_YEAR, currentTimes.year, 'year'],
      ],
      [currentTimes]
    );

    useInterval(() => {
      const now = Date.now();
      setCurrentTimes(previousTimes => ({
        ...previousTimes,
        second: now,
      }));

      let scaleIndex = 0;
      let keepGoing = true;

      while (keepGoing) {
        const [currentScale, currentGetter, currentKey] = scaleSequence[scaleIndex];
        const previousValueAtScale = Math.floor(currentGetter / currentScale);
        const thisValueAtScale = Math.floor(now / currentScale);

        if (previousValueAtScale !== thisValueAtScale) {
          setCurrentTimes(previousTimes => ({
            ...previousTimes,
            [currentKey]: now,
          }));
          scaleIndex = scaleIndex + 1;
        } else {
          keepGoing = false;
        }
      }
    }, intervalToUse);

    const [registerYearConsumer, unregisterYearConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      'year'
    );
    const [registerMonthConsumer, unregisterMonthConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      'month'
    );
    const [registerDayConsumer, unregisterDayConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      'day'
    );
    const [registerHourConsumer, unregisterHourConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      'hour'
    );
    const [registerMinuteConsumer, unregisterMinuteConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      'minute'
    );
    const [registerSecondConsumer, unregisterSecondConsumer] = generateRegistrationFunctions(
      setConsumerRegistrations,
      'second'
    );

    const yearValue = generateValueObject(
      registerYearConsumer,
      ONE_YEAR,
      currentTimes.year,
      unregisterYearConsumer
    );
    const monthValue = generateValueObject(
      registerMonthConsumer,
      ONE_MONTH,
      currentTimes.month,
      unregisterMonthConsumer
    );
    const dayValue = generateValueObject(
      registerDayConsumer,
      ONE_DAY,
      currentTimes.day,
      unregisterDayConsumer
    );
    const hourValue = generateValueObject(
      registerHourConsumer,
      ONE_HOUR,
      currentTimes.hour,
      unregisterHourConsumer
    );
    const minuteValue = generateValueObject(
      registerMinuteConsumer,
      ONE_MINUTE,
      currentTimes.minute,
      unregisterMinuteConsumer
    );
    const secondValue = generateValueObject(
      registerSecondConsumer,
      ONE_SECOND,
      currentTimes.second,
      unregisterSecondConsumer
    );

    return (
      <GlobalMinimumAccuracyContext.Provider value={globalMinimumAccuracy}>
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
    ONE_DAY,
    ONE_HOUR,
    ONE_MINUTE,
    ONE_MONTH,
    ONE_SECOND,
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
