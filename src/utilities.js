import { useContext } from 'react';

export const generateTimeContextConsumptionHook = TimeContext => timeFormatter => {
  const { time } = useContext(TimeContext);

  if (timeFormatter) {
    return timeFormatter(time);
  }

  return time;
};
