import useOptimalTimeContext from '../useOptimalTimeContext';
import AccuracyMap from '../../classes/AccuracyMap';
import ONE_SECOND from '../../durations/ONE_SECOND';

jest.mock('../../classes/AccuracyMap', () => {
  const ONE_SECOND = require('../../durations/ONE_SECOND').default;
  class MockAccuracyMap {
    getOptimalContext() {
      return ONE_SECOND.context;
    }
  }

  return MockAccuracyMap;
});

describe('useOptimalTimeContext()', () => {
  it('returns the correct duration when passed only a single duration', () => {
    const context = useOptimalTimeContext([ONE_SECOND], 999, new AccuracyMap(), new AccuracyMap());
    expect(context).toBe(ONE_SECOND.context);
  });
});
