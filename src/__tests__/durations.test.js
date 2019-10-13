import * as DURATIONS from '../durations';
import SecondContext from '../TimeProviders/SecondContext';
import MinuteContext from '../TimeProviders/MinuteContext';
import HourContext from '../TimeProviders/HourContext';
import DayContext from '../TimeProviders/DayContext';
import MonthContext from '../TimeProviders/MonthContext';
import YearContext from '../TimeProviders/YearContext';

jest.mock('../TimeProviders/SecondContext', () => 'SecondContext');
jest.mock('../TimeProviders/MinuteContext', () => 'MinuteContext');
jest.mock('../TimeProviders/HourContext', () => 'HourContext');
jest.mock('../TimeProviders/DayContext', () => 'DayContext');
jest.mock('../TimeProviders/MonthContext', () => 'MonthContext');
jest.mock('../TimeProviders/YearContext', () => 'YearContext');

describe('durations', () => {
  // We should specifically fail if there are any extra durations specified.
  it('exports exactly the correct durations', () => {
    /* eslint-disable sort-keys */
    expect(DURATIONS).toEqual({
      ONE_SECOND: {
        context: SecondContext,
        key: 'oneSecond',
        value: 1000,
      },
      ONE_MINUTE: {
        context: MinuteContext,
        key: 'oneMinute',
        value: 60000,
      },
      ONE_HOUR: {
        context: HourContext,
        key: 'oneHour',
        value: 3600000,
      },
      ONE_DAY: {
        context: DayContext,
        key: 'oneDay',
        value: 86400000,
      },
      // ONE_WEEK: {
      //   key: 'oneWeek',
      //   value: 604800000,
      // },
      ONE_MONTH: {
        context: MonthContext,
        key: 'oneMonth',
        value: 2592000000,
      },
      ONE_YEAR: {
        context: YearContext,
        key: 'oneYear',
        value: 31536000000,
      },
    });
    /* eslint-enable sort-keys */
  });
});
