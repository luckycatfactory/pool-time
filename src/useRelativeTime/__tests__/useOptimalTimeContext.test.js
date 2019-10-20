import useOptimalTimeContext from '../useOptimalTimeContext';
import { ONE_SECOND } from '../../durations';

describe('useOptimalTimeContext()', () => {
  it('returns the correct duration when passed only a single duration', () => {
    const context = useOptimalTimeContext([ONE_SECOND], 999, {}, {});
    expect(context).toBe(ONE_SECOND.context);
  });
});
