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

const generateConsumerRegistrationIncrementer = setConsumerRegistration => () =>
  setConsumerRegistration(previousValue => previousValue + 1);
const generateConsumerRegistrationDecrementer = setConsumerRegistration => () =>
  setConsumerRegistration(previousValue => previousValue - 1);

const generateValueObjectCreator = (registerConsumer, scale, time, unregisterConsumer) => () => ({
  registerConsumer,
  scale,
  time,
  unregisterConsumer,
});

const TimeProviders = React.memo(
  ({ children, globalMinimumAccuracy, onIntervalUpdate, onRegistrationsUpdate }) => {
    // For consistency, we prefer to always ensure that all "now" references are the same in a single
    // render.
    const nowOnInitialRendering = useRef(Date.now());

    const [currentTimeToTheDay, setCurrentTimeToTheDay] = useState(nowOnInitialRendering.current);
    const [currentTimeToTheHour, setCurrentTimeToTheHour] = useState(nowOnInitialRendering.current);
    const [currentTimeToTheMinute, setCurrentTimeToTheMinute] = useState(
      nowOnInitialRendering.current
    );
    const [currentTimeToTheMonth, setCurrentTimeToTheMonth] = useState(
      nowOnInitialRendering.current
    );
    const [currentTimeToTheSecond, setCurrentTimeToTheSecond] = useState(
      nowOnInitialRendering.current
    );
    const [currentTimeToTheYear, setCurrentTimeToTheYear] = useState(nowOnInitialRendering.current);
    const [dayConsumerRegistrations, setDayConsumerRegistrations] = useState(0);
    const [hourConsumerRegistrations, setHourConsumerRegistrations] = useState(0);
    const [minuteConsumerRegistrations, setMinuteConsumerRegistrations] = useState(0);
    const [monthConsumerRegistrations, setMonthConsumerRegistrations] = useState(0);
    const [secondConsumerRegistrations, setSecondConsumerRegistrations] = useState(0);
    const [yearConsumerRegistrations, setYearConsumerRegistrations] = useState(0);

    const vaildatedGlobalMinimumAccuracy = useMemo(
      () => validateGlobalMinimumAccuracy(globalMinimumAccuracy),
      [globalMinimumAccuracy]
    );

    const intervalToUse = useMemo(() => {
      if (secondConsumerRegistrations) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_SECOND, vaildatedGlobalMinimumAccuracy);
      } else if (minuteConsumerRegistrations) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_MINUTE, vaildatedGlobalMinimumAccuracy);
      } else if (hourConsumerRegistrations) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_HOUR, vaildatedGlobalMinimumAccuracy);
      } else if (dayConsumerRegistrations) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_DAY, vaildatedGlobalMinimumAccuracy);
      } else if (monthConsumerRegistrations) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_MONTH, vaildatedGlobalMinimumAccuracy);
      } else if (yearConsumerRegistrations) {
        return getIntervalToUseOrMinimumallyAccepted(ONE_YEAR, vaildatedGlobalMinimumAccuracy);
      } else {
        return null;
      }
    }, [
      dayConsumerRegistrations,
      hourConsumerRegistrations,
      minuteConsumerRegistrations,
      monthConsumerRegistrations,
      secondConsumerRegistrations,
      yearConsumerRegistrations,
      vaildatedGlobalMinimumAccuracy,
    ]);

    useEffect(() => {
      onIntervalUpdate(intervalToUse);
    }, [intervalToUse]);

    useEffect(() => {
      onRegistrationsUpdate({
        dayConsumerRegistrations,
        hourConsumerRegistrations,
        minuteConsumerRegistrations,
        monthConsumerRegistrations,
        secondConsumerRegistrations,
        yearConsumerRegistrations,
      });
    }, [
      dayConsumerRegistrations,
      hourConsumerRegistrations,
      minuteConsumerRegistrations,
      monthConsumerRegistrations,
      secondConsumerRegistrations,
      yearConsumerRegistrations,
    ]);

    useInterval(() => {
      const now = Date.now();
      setCurrentTimeToTheSecond(now);

      const previousMinute = Math.floor(currentTimeToTheMinute / ONE_MINUTE);
      const thisMinute = Math.floor(now / ONE_MINUTE);
      const isNewMinute = previousMinute !== thisMinute;

      if (isNewMinute) {
        setCurrentTimeToTheMinute(now);

        const previousHour = Math.floor(previousMinute / 60);
        const thisHour = Math.floor(thisMinute / 60);
        const isNewHour = previousHour !== thisHour;

        if (isNewHour) {
          setCurrentTimeToTheHour(now);

          const previousDay = Math.floor(previousHour / 24);
          const thisDay = Math.floor(thisHour / 24);
          const isNewDay = previousDay !== thisDay;

          if (isNewDay) {
            setCurrentTimeToTheDay(now);

            const previousMonth = Math.floor(previousDay / 30);
            const thisMonth = Math.floor(thisDay / 30);
            const isNewMonth = previousMonth !== thisMonth;

            if (isNewMonth) {
              setCurrentTimeToTheMonth(now);

              const previousYear = Math.floor(previousDay / 365);
              const thisYear = Math.floor(thisDay / 365);
              const isNewYear = previousYear !== thisYear;

              if (isNewYear) {
                setCurrentTimeToTheYear(now);
              }
            }
          }
        }
      }
    }, intervalToUse);

    // Year
    const registerYearConsumer = useCallback(
      generateConsumerRegistrationIncrementer(setYearConsumerRegistrations),
      []
    );
    const unregisterYearConsumer = useCallback(
      generateConsumerRegistrationDecrementer(setYearConsumerRegistrations),
      []
    );
    // Month
    const registerMonthConsumer = useCallback(
      generateConsumerRegistrationIncrementer(setMonthConsumerRegistrations),
      []
    );
    const unregisterMonthConsumer = useCallback(
      generateConsumerRegistrationDecrementer(setMonthConsumerRegistrations),
      []
    );
    // Day
    const registerDayConsumer = useCallback(
      generateConsumerRegistrationIncrementer(setDayConsumerRegistrations),
      []
    );
    const unregisterDayConsumer = useCallback(
      generateConsumerRegistrationDecrementer(setDayConsumerRegistrations),
      []
    );
    // Hour
    const registerHourConsumer = useCallback(
      generateConsumerRegistrationIncrementer(setHourConsumerRegistrations),
      []
    );
    const unregisterHourConsumer = useCallback(
      generateConsumerRegistrationDecrementer(setHourConsumerRegistrations),
      []
    );
    // Minute
    const registerMinuteConsumer = useCallback(
      generateConsumerRegistrationIncrementer(setMinuteConsumerRegistrations),
      []
    );
    const unregisterMinuteConsumer = useCallback(
      generateConsumerRegistrationDecrementer(setMinuteConsumerRegistrations),
      []
    );
    // Second
    const registerSecondConsumer = useCallback(
      generateConsumerRegistrationIncrementer(setSecondConsumerRegistrations),
      []
    );
    const unregisterSecondConsumer = useCallback(
      generateConsumerRegistrationDecrementer(setSecondConsumerRegistrations),
      []
    );

    const yearValue = useMemo(
      generateValueObjectCreator(
        registerYearConsumer,
        ONE_YEAR,
        currentTimeToTheYear,
        unregisterYearConsumer
      ),
      [currentTimeToTheYear]
    );
    const monthValue = useMemo(
      generateValueObjectCreator(
        registerMonthConsumer,
        ONE_MONTH,
        currentTimeToTheMonth,
        unregisterMonthConsumer
      ),
      [currentTimeToTheMonth]
    );
    const dayValue = useMemo(
      generateValueObjectCreator(
        registerDayConsumer,
        ONE_DAY,
        currentTimeToTheDay,
        unregisterDayConsumer
      ),
      [currentTimeToTheDay]
    );
    const hourValue = useMemo(
      generateValueObjectCreator(
        registerHourConsumer,
        ONE_HOUR,
        currentTimeToTheHour,
        unregisterHourConsumer
      ),
      [currentTimeToTheHour]
    );
    const minuteValue = useMemo(
      generateValueObjectCreator(
        registerMinuteConsumer,
        ONE_MINUTE,
        currentTimeToTheMinute,
        unregisterMinuteConsumer
      ),
      [currentTimeToTheMinute]
    );
    const secondValue = useMemo(
      generateValueObjectCreator(
        registerSecondConsumer,
        ONE_SECOND,
        currentTimeToTheSecond,
        unregisterSecondConsumer
      ),
      [currentTimeToTheSecond]
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
