import { useContext, useRef } from 'react';
import SecondContext from './TimeProviders/SecondContext';
import MinuteContext from './TimeProviders/MinuteContext';

const useRelativeTime = (targetTime, timeFormatter) => {
  const TimeContext = useRef(SecondContext);

  const difference = Date.now() - targetTime;

  if (difference >= 1000 * 60) {
    TimeContext.current = MinuteContext;
  }

  const { scale, time } = useContext(TimeContext.current);
  console.log('x', scale, time);
  const latestDifference = Math.max(time - targetTime, scale);

  if (timeFormatter) {
    return timeFormatter(latestDifference);
  }

  return latestDifference;
};

export default useRelativeTime;
