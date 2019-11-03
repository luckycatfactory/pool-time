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
      FIVE_SECONDS: {
        context: expect.any(Object),
        key: 'fiveSeconds',
        value: 5000,
      },
      TEN_SECONDS: {
        context: expect.any(Object),
        key: 'tenSeconds',
        value: 10000,
      },
      FIFTEEN_SECONDS: {
        context: expect.any(Object),
        key: 'fifteenSeconds',
        value: 15000,
      },
      TWENTY_SECONDS: {
        context: expect.any(Object),
        key: 'twentySeconds',
        value: 20000,
      },
      THIRTY_SECONDS: {
        context: expect.any(Object),
        key: 'thirtySeconds',
        value: 30000,
      },
      ONE_MINUTE: {
        context: expect.any(Object),
        key: 'oneMinute',
        value: 60000,
      },
      FIVE_MINUTES: {
        context: expect.any(Object),
        key: 'fiveMinutes',
        value: 60000 * 5,
      },
      TEN_MINUTES: {
        context: expect.any(Object),
        key: 'tenMinutes',
        value: 60000 * 10,
      },
      FIFTEEN_MINUTES: {
        context: expect.any(Object),
        key: 'fifteenMinutes',
        value: 60000 * 15,
      },
      TWENTY_MINUTES: {
        context: expect.any(Object),
        key: 'twentyMinutes',
        value: 60000 * 20,
      },
      THIRTY_MINUTES: {
        context: expect.any(Object),
        key: 'thirtyMinutes',
        value: 60000 * 30,
      },
      ONE_HOUR: {
        context: expect.any(Object),
        key: 'oneHour',
        value: 3600000,
      },
      TWO_HOURS: {
        context: expect.any(Object),
        key: 'twoHours',
        value: 3600000 * 2,
      },
      THREE_HOURS: {
        context: expect.any(Object),
        key: 'threeHours',
        value: 3600000 * 3,
      },
      SIX_HOURS: {
        context: expect.any(Object),
        key: 'sixHours',
        value: 3600000 * 6,
      },
      TWELVE_HOURS: {
        context: expect.any(Object),
        key: 'twelveHours',
        value: 3600000 * 12,
      },
      ONE_DAY: {
        context: expect.any(Object),
        key: 'oneDay',
        value: 86400000,
      },
      ONE_WEEK: {
        context: expect.any(Object),
        key: 'oneWeek',
        value: 604800000,
      },
    });
    /* eslint-enable sort-keys */
  });
});
