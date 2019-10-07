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
    const registerYearConsumer = useCallback(() => {
      setYearConsumerRegistrations(previousCount => previousCount + 1);
    }, []);
    const unregisterYearConsumer = useCallback(() => {
      setYearConsumerRegistrations(previousCount => previousCount - 1);
    }, []);
    // Month
    const registerMonthConsumer = useCallback(() => {
      setMonthConsumerRegistrations(previousCount => previousCount + 1);
    }, []);
    const unregisterMonthConsumer = useCallback(() => {
      setMonthConsumerRegistrations(previousCount => previousCount - 1);
    }, []);
    // Day
    const registerDayConsumer = useCallback(() => {
      setDayConsumerRegistrations(previousCount => previousCount + 1);
    }, []);
    const unregisterDayConsumer = useCallback(() => {
      setDayConsumerRegistrations(previousCount => previousCount - 1);
    }, []);
    // Hour
    const registerHourConsumer = useCallback(() => {
      setHourConsumerRegistrations(previousCount => previousCount + 1);
    }, []);
    const unregisterHourConsumer = useCallback(() => {
      setHourConsumerRegistrations(previousCount => previousCount - 1);
    }, []);
    // Minute
    const registerMinuteConsumer = useCallback(() => {
      setMinuteConsumerRegistrations(previousCount => previousCount + 1);
    }, []);
    const unregisterMinuteConsumer = useCallback(() => {
      setMinuteConsumerRegistrations(previousCount => previousCount - 1);
    }, []);
    // Second
    const registerSecondConsumer = useCallback(() => {
      setSecondConsumerRegistrations(previousCount => previousCount + 1);
    }, []);
    const unregisterSecondConsumer = useCallback(() => {
      setSecondConsumerRegistrations(previousCount => previousCount - 1);
    }, []);

    const yearValue = useMemo(
      () => ({
        registerConsumer: registerYearConsumer,
        scale: ONE_YEAR,
        time: currentTimeToTheYear,
        unregisterConsumer: unregisterYearConsumer,
      }),
      [currentTimeToTheYear]
    );
    const monthValue = useMemo(
      () => ({
        registerConsumer: registerMonthConsumer,
        scale: ONE_MONTH,
        time: currentTimeToTheMonth,
        unregisterConsumer: unregisterMonthConsumer,
      }),
      [currentTimeToTheMonth]
    );
    const dayValue = useMemo(
      () => ({
        registerConsumer: registerDayConsumer,
        scale: ONE_DAY,
        time: currentTimeToTheDay,
        unregisterConsumer: unregisterDayConsumer,
      }),
      [currentTimeToTheDay]
    );
    const hourValue = useMemo(
      () => ({
        registerConsumer: registerHourConsumer,
        scale: ONE_HOUR,
        time: currentTimeToTheHour,
        unregisterConsumer: unregisterHourConsumer,
      }),
      [currentTimeToTheHour]
    );
    const minuteValue = useMemo(
      () => ({
        registerConsumer: registerMinuteConsumer,
        scale: ONE_MINUTE,
        time: currentTimeToTheMinute,
        unregisterConsumer: unregisterMinuteConsumer,
      }),
      [currentTimeToTheMinute]
    );
    const secondValue = useMemo(
      () => ({
        registerConsumer: registerSecondConsumer,
        scale: ONE_SECOND,
        time: currentTimeToTheSecond,
        unregisterConsumer: unregisterSecondConsumer,
      }),
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
