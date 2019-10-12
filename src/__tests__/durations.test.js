import * as DURATIONS from '../durations';

describe('durations', () => {
  it('exports exactly the correct durations', () => {
    expect(DURATIONS).toEqual({
      ONE_DAY: 86400000,
      ONE_HOUR: 3600000,
      ONE_MINUTE: 60000,
      ONE_MONTH: 2592000000,
      ONE_SECOND: 1000,
      ONE_WEEK: 604800000,
      ONE_YEAR: 31536000000,
    });
  });
});
