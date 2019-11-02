import { useContext, useEffect } from 'react';

const generateTimeContextConsumptionHook = TimeContext => timeFormatter => {
  const { registerConsumer, time, unregisterConsumer } = useContext(TimeContext);

  useEffect(() => {
    registerConsumer();

    return unregisterConsumer;
  }, [registerConsumer, unregisterConsumer]);

  if (timeFormatter) {
    return timeFormatter(time);
  }

  return time;
};

export default generateTimeContextConsumptionHook;
