import React from 'react';

import MinuteContext from './MinuteContext';
import SecondContext from './SecondContext';
import useInterval from '../useInterval';
import { ONE_MINUTE } from '../constants';

const initialNow = Date.now();

const defaultValue = {
  timeByTheDay: initialNow,
  timeByTheHour: initialNow,
  timeByTheMinute: initialNow,
  timeByTheMonth: initialNow,
  timeByTheSecond: initialNow,
  timeByTheWeek: initialNow,
  timeByTheYear: initialNow,
};

const TimeContext = React.createContext(defaultValue);

const TimeProvider = React.memo(({ children }) => {
  const now = Date.now();

  const [currentTimeToTheSecond, setCurrentTimeToTheSecond] = useState(now);
  const [currentTimeToTheMinute, setCurrentTimeToTheMinute] = useState(now);

  useInterval(() => {
    const now = Date.now();
    setCurrentTimeToTheSecond(now);

    const previousMinute = Math.floor(currentTimeToTheMinute / ONE_MINUTE);
    const thisMinute = Math.floor(now / ONE_MINUTE);
    const isNewMinute = previousMinute !== thisMinute;

    if (isNewMinute) {
      setCurrentTimeToTheMinute(now);
    }
  }, ONE_SECOND);

  return (
    <MinuteContext.Provider value={currentTimeToTheMinute}>
      <SecondContext.Provider value={currentTimeToTheSecond}>
        {children}
      </SecondContext.Provider>
    </MinuteContext.Provider>
  )
})

export default TimeContext;
