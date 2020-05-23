import * as timeObjects from '../timeObjects';

describe('Exposed time objects', () => {
  const _ONE_SECOND = 1000;
  const _ONE_MINUTE = _ONE_SECOND * 60;
  const _ONE_HOUR = _ONE_MINUTE * 60;

  it('matches the exact correct shape', () => {
    expect(timeObjects).toEqual({
      // SECONDS
      ONE_SECOND: {
        context: expect.any(Object),
        key: 'ONE_SECOND',
        value: _ONE_SECOND,
      },
      TWO_SECONDS: {
        context: expect.any(Object),
        key: 'TWO_SECONDS',
        value: _ONE_SECOND * 2,
      },
      THREE_SECONDS: {
        context: expect.any(Object),
        key: 'THREE_SECONDS',
        value: _ONE_SECOND * 3,
      },
      FOUR_SECONDS: {
        context: expect.any(Object),
        key: 'FOUR_SECONDS',
        value: _ONE_SECOND * 4,
      },
      FIVE_SECONDS: {
        context: expect.any(Object),
        key: 'FIVE_SECONDS',
        value: _ONE_SECOND * 5,
      },
      TEN_SECONDS: {
        context: expect.any(Object),
        key: 'TEN_SECONDS',
        value: _ONE_SECOND * 10,
      },
      FIFTEEN_SECONDS: {
        context: expect.any(Object),
        key: 'FIFTEEN_SECONDS',
        value: _ONE_SECOND * 15,
      },
      TWENTY_SECONDS: {
        context: expect.any(Object),
        key: 'TWENTY_SECONDS',
        value: _ONE_SECOND * 20,
      },
      THIRTY_SECONDS: {
        context: expect.any(Object),
        key: 'THIRTY_SECONDS',
        value: _ONE_SECOND * 30,
      },
      // MINUTES
      ONE_MINUTE: {
        context: expect.any(Object),
        key: 'ONE_MINUTE',
        value: _ONE_MINUTE,
      },
      TWO_MINUTES: {
        context: expect.any(Object),
        key: 'TWO_MINUTES',
        value: _ONE_MINUTE * 2,
      },
      THREE_MINUTES: {
        context: expect.any(Object),
        key: 'THREE_MINUTES',
        value: _ONE_MINUTE * 3,
      },
      FOUR_MINUTES: {
        context: expect.any(Object),
        key: 'FOUR_MINUTES',
        value: _ONE_MINUTE * 4,
      },
      FIVE_MINUTES: {
        context: expect.any(Object),
        key: 'FIVE_MINUTES',
        value: _ONE_MINUTE * 5,
      },
      TEN_MINUTES: {
        context: expect.any(Object),
        key: 'TEN_MINUTES',
        value: _ONE_MINUTE * 10,
      },
      FIFTEEN_MINUTES: {
        context: expect.any(Object),
        key: 'FIFTEEN_MINUTES',
        value: _ONE_MINUTE * 15,
      },
      TWENTY_MINUTES: {
        context: expect.any(Object),
        key: 'TWENTY_MINUTES',
        value: _ONE_MINUTE * 20,
      },
      THIRTY_MINUTES: {
        context: expect.any(Object),
        key: 'THIRTY_MINUTES',
        value: _ONE_MINUTE * 30,
      },
      FORTY_FIVE_MINUTES: {
        context: expect.any(Object),
        key: 'FORTY_FIVE_MINUTES',
        value: _ONE_MINUTE * 45,
      },
      // HOURS
      ONE_HOUR: {
        context: expect.any(Object),
        key: 'ONE_HOUR',
        value: _ONE_HOUR,
      },
      TWO_HOURS: {
        context: expect.any(Object),
        key: 'TWO_HOURS',
        value: _ONE_HOUR * 2,
      },
      THREE_HOURS: {
        context: expect.any(Object),
        key: 'THREE_HOURS',
        value: _ONE_HOUR * 3,
      },
      FOUR_HOURS: {
        context: expect.any(Object),
        key: 'FOUR_HOURS',
        value: _ONE_HOUR * 4,
      },
      FIVE_HOURS: {
        context: expect.any(Object),
        key: 'FIVE_HOURS',
        value: _ONE_HOUR * 5,
      },
      SIX_HOURS: {
        context: expect.any(Object),
        key: 'SIX_HOURS',
        value: _ONE_HOUR * 6,
      },
      // META
      ETERNITY: {
        key: 'ETERNITY',
        value: Number.POSITIVE_INFINITY,
      },
    });
  });
});
