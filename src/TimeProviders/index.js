import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import DayContext from './DayContext';
import HourContext from './HourContext';
import MinuteContext from './MinuteContext';
import MonthContext from './MonthContext';
import SecondContext from './SecondContext';
import YearContext from './YearContext';
import useInterval from '../useInterval';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from '../constants';

const TimeProviders = React.memo(({ children }) => {
  const now = Date.now();

  const [currentTimeToTheDay, setCurrentTimeToTheDay] = useState(now);
  const [currentTimeToTheHour, setCurrentTimeToTheHour] = useState(now);
  const [currentTimeToTheMinute, setCurrentTimeToTheMinute] = useState(now);
  const [currentTimeToTheMonth, setCurrentTimeToTheMonth] = useState(now);
  const [currentTimeToTheSecond, setCurrentTimeToTheSecond] = useState(now);
  const [currentTimeToTheYear, setCurrentTimeToTheYear] = useState(now);

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
  }, ONE_SECOND);

  const yearValue = useMemo(
    () => ({
      scale: ONE_YEAR,
      time: currentTimeToTheYear,
    }),
    [currentTimeToTheYear]
  );
  const monthValue = useMemo(
    () => ({
      scale: ONE_MONTH,
      time: currentTimeToTheMonth,
    }),
    [currentTimeToTheMonth]
  );
  const dayValue = useMemo(
    () => ({
      scale: ONE_DAY,
      time: currentTimeToTheDay,
    }),
    [currentTimeToTheDay]
  );
  const hourValue = useMemo(
    () => ({
      scale: ONE_HOUR,
      time: currentTimeToTheHour,
    }),
    [currentTimeToTheHour]
  );
  const minuteValue = useMemo(
    () => ({
      scale: ONE_MINUTE,
      time: currentTimeToTheMinute,
    }),
    [currentTimeToTheMinute]
  );
  const secondValue = useMemo(
    () => ({
      scale: ONE_SECOND,
      time: currentTimeToTheSecond,
    }),
    [currentTimeToTheSecond]
  );

  return (
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
  );
});

TimeProviders.displayName = 'TimeProviders';

TimeProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TimeProviders;
