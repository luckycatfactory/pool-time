import { useContext, useEffect, useRef } from 'react';
import DayContext from '../TimeProviders/DayContext';
import GlobalMinimumAccuracyContext from '../TimeProviders/GlobalMinimumAccuracyContext';
import HourContext from '../TimeProviders/HourContext';
import MinuteContext from '../TimeProviders/MinuteContext';
import MonthContext from '../TimeProviders/MonthContext';
import SecondContext from '../TimeProviders/SecondContext';
import YearContext from '../TimeProviders/YearContext';
import { getDateNow } from '../utilities';
import getOptimalTimeContext from './getOptimalTimeContext';

const generateRelativeTimeObject = (scale, time, timeDifference, timeWithFormat) => ({
  scale,
  time,
  timeDifference,
  timeWithFormat,
});

const useRelativeTime = (targetTime, options = {}) => {
  const {
    strictnessOptions = {
      days: DayContext,
      hours: HourContext,
      minutes: MinuteContext,
      months: MonthContext,
      seconds: SecondContext,
      years: YearContext,
    },
    timeFormatter = inputTime => inputTime,
  } = options;
  const TimeContext = useRef(SecondContext);
  const hasRegisteredConsumer = useRef(false);
  const previousUnregisterConsumer = useRef(null);
  const isInitialRender = useRef(true);
  const globalMinimumAccuracy = useContext(GlobalMinimumAccuracyContext);

  const rawDifference = getDateNow() - targetTime;
  const nextTimeContext = getOptimalTimeContext(
    rawDifference,
    globalMinimumAccuracy,
    strictnessOptions
  );

  const hasContextUpdated = TimeContext.current !== nextTimeContext;

  if (hasContextUpdated && previousUnregisterConsumer.current) {
    previousUnregisterConsumer.current();
    hasRegisteredConsumer.current = false;
  }
  TimeContext.current = nextTimeContext;

  const { registerConsumer, scale, time, unregisterConsumer } = useContext(TimeContext.current);

  previousUnregisterConsumer.current = unregisterConsumer;

  if (!hasRegisteredConsumer.current) {
    registerConsumer();
    hasRegisteredConsumer.current = true;
  }

  // This performs the unregistration after unmount.
  useEffect(
    () => () => {
      previousUnregisterConsumer.current();
    },
    []
  );

  const differenceAccountingForContextChange = hasContextUpdated
    ? rawDifference
    : time - targetTime;
  const timeDifferenceToUse = hasContextUpdated
    ? differenceAccountingForContextChange >= 0
      ? Math.max(differenceAccountingForContextChange, scale)
      : Math.min(differenceAccountingForContextChange, scale)
    : isInitialRender.current
    ? rawDifference
    : differenceAccountingForContextChange;
  const preferredTime = hasContextUpdated ? getDateNow() : time;
  const timeWithFormat = timeFormatter(preferredTime);

  if (isInitialRender.current) {
    isInitialRender.current = false;
  }

  return generateRelativeTimeObject(scale, preferredTime, timeDifferenceToUse, timeWithFormat);
};

export default useRelativeTime;
