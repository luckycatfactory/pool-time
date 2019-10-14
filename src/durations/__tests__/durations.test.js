import * as DURATIONS from '../';

describe('durations', () => {
  // We should specifically fail if there are any extra durations specified.
  it('exports exactly the correct durations', () => {
    /* eslint-disable sort-keys */
    expect(DURATIONS).toEqual({
      ONE_SECOND: {
        context: expect.any(Object),
        key: 'oneSecond',
        value: 1000,
      },
      ONE_MINUTE: {
        context: expect.any(Object),
        key: 'oneMinute',
        value: 60000,
      },
      ONE_HOUR: {
        context: expect.any(Object),
        key: 'oneHour',
        value: 3600000,
      },
      ONE_DAY: {
        context: expect.any(Object),
        key: 'oneDay',
        value: 86400000,
      },
      // ONE_WEEK: {
      //   key: 'oneWeek',
      //   value: 604800000,
      // },
      ONE_MONTH: {
        context: expect.any(Object),
        key: 'oneMonth',
        value: 2592000000,
      },
      ONE_YEAR: {
        context: expect.any(Object),
        key: 'oneYear',
        value: 31536000000,
      },
    });
    /* eslint-enable sort-keys */
  });
});
