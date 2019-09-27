import { useContext, useRef } from 'react';
import DayContext from './TimeProviders/DayContext';
import HourContext from './TimeProviders/HourContext';
import MinuteContext from './TimeProviders/MinuteContext';
import MonthContext from './TimeProviders/MonthContext';
import SecondContext from './TimeProviders/SecondContext';
import YearContext from './TimeProviders/YearContext';

import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_YEAR } from './constants';

const useRelativeTime = (targetTime, timeFormatter) => {
  const TimeContext = useRef(SecondContext);

  const difference = Date.now() - targetTime;

  if (difference >= ONE_MINUTE) {
    TimeContext.current = MinuteContext;
  } else if (difference >= ONE_HOUR) {
    TimeContext.current = HourContext;
  } else if (difference >= ONE_DAY) {
    TimeContext.current = DayContext;
  } else if (difference >= ONE_MONTH) {
    TimeContext.current = MonthContext;
  } else if (difference >= ONE_YEAR) {
    TimeContext.current = YearContext;
  }

  const { scale, time } = useContext(TimeContext.current);
  const latestDifference = Math.max(time - targetTime, scale);

  if (timeFormatter) {
    return timeFormatter(latestDifference);
  }

  return latestDifference;
};

export default useRelativeTime;
