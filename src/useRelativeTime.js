import { useContext, useRef } from 'react';
import DayContext from './TimeProviders/DayContext';
import HourContext from './TimeProviders/HourContext';
import MinuteContext from './TimeProviders/MinuteContext';
import MonthContext from './TimeProviders/MonthContext';
import SecondContext from './TimeProviders/SecondContext';
import YearContext from './TimeProviders/YearContext';

import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_YEAR } from './constants';

const generateRelativeTimeObject = (scale, time, timeDifference, timeFormatter) => ({
  scale,
  time,
  timeDifference,
  timeWithFormat: timeFormatter(time),
});

const useRelativeTime = (targetTime, timeFormatter = inputTime => inputTime, isStrict = false) => {
  const TimeContext = useRef(SecondContext);
  const wasStrict = useRef(isStrict);

  if (!wasStrict.current && isStrict) {
    TimeContext.current = SecondContext;
  } else if (!isStrict) {
    const difference = Date.now() - targetTime;

    if (difference >= ONE_MINUTE) {
      TimeContext.current = MinuteContext;
      if (difference >= ONE_HOUR) {
        TimeContext.current = HourContext;
        if (difference >= ONE_DAY) {
          TimeContext.current = DayContext;
          if (difference >= ONE_MONTH) {
            TimeContext.current = MonthContext;
            if (difference >= ONE_YEAR) {
              TimeContext.current = YearContext;
            }
          }
        }
      }
    }
  }

  wasStrict.current = isStrict;

  const { scale, time } = useContext(TimeContext.current);
  const rawDifference = time - targetTime;
  const timeDifference =
    rawDifference >= 0 ? Math.max(rawDifference, scale) : Math.min(rawDifference, scale);

  return generateRelativeTimeObject(scale, time, timeDifference, timeFormatter);
};

export default useRelativeTime;
