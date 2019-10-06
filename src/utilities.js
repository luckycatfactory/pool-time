import { useContext, useEffect } from 'react';

export const generateTimeContextConsumptionHook = TimeContext => timeFormatter => {
  const { registerConsumer, time, unregisterConsumer } = useContext(TimeContext);

  useEffect(() => {
    registerConsumer();

    return unregisterConsumer;
  }, []);

  if (timeFormatter) {
    return timeFormatter(time);
  }

  return time;
};
