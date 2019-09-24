import React, { useState } from 'react';

import DayContext from './DayContext';
import HourContext from './HourContext';
import MinuteContext from './MinuteContext';
import MonthContext from './MonthContext';
import SecondContext from './SecondContext';
import YearContext from './YearContext';
import useInterval from '../useInterval';
import { ONE_MINUTE, ONE_SECOND } from '../constants';

const initialNow = Date.now();

const TimeProvider = React.memo(({ children }) => {
  const now = Date.now();

  const [currentTimeToTheDay, setCurrentTimeToTheDay] = useState(now);
  const [currentTimeToTheHour, setCurrentTimeToTheHour] = useState(now);
  const [currentTimeToTheMinute, setCurrentTimeToTheMinute] = useState(now);
  const [currentTimeToTheMonth, setCurrentTimeToTheMonth] = useState(now);
  const [currentTimeToTheSecond, setCurrentTimeToTheSecond] = useState(now);

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
          const thisMonth = Math.floor(thisDay / 24);
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

  return (
    <MonthContext.Provider value={currentTimeToTheMonth}>
      <DayContext.Provider value={currentTimeToTheDay}>
        <HourContext.Provider value={currentTimeToTheHour}>
          <MinuteContext.Provider value={currentTimeToTheMinute}>
            <SecondContext.Provider value={currentTimeToTheSecond}>
              {children}
            </SecondContext.Provider>
          </MinuteContext.Provider>
        </HourContext.Provider>
      </DayContext.Provider>
    </MonthContext.Provider>
  )
})

export default TimeProvider;
