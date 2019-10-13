import DayContext from './TimeProviders/DayContext';
import HourContext from './TimeProviders/HourContext';
import MinuteContext from './TimeProviders/MinuteContext';
import MonthContext from './TimeProviders/MonthContext';
import SecondContext from './TimeProviders/SecondContext';
import YearContext from './TimeProviders/YearContext';

const generateDurationObject = (context, key, value) => ({
  context,
  key,
  value,
});

export const ONE_SECOND = generateDurationObject(SecondContext, 'oneSecond', 1000);

export const ONE_MINUTE = generateDurationObject(MinuteContext, 'oneMinute', 60 * ONE_SECOND.value);

export const ONE_HOUR = generateDurationObject(HourContext, 'oneHour', 60 * ONE_MINUTE.value);

export const ONE_DAY = generateDurationObject(DayContext, 'oneDay', 24 * ONE_HOUR.value);

// Currently unusued, and there's no context yet. Add back later.
// export const ONE_WEEK = generateDurationObject(WeekContext, 'oneWeek', 7 * ONE_DAY.value);

export const ONE_MONTH = generateDurationObject(MonthContext, 'oneMonth', 30 * ONE_DAY.value);

export const ONE_YEAR = generateDurationObject(YearContext, 'oneYear', 365 * ONE_DAY.value);
