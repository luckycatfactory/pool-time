import * as reactPoolTime from '../';
import { generateTimeProviders } from '../TimeProviders';
import useRelativeTime from '../useRelativeTime';
import * as DURATIONS from '../durations';
import generateDuration from '../utilities/generateDuration';

describe('react-pool-time API', () => {
  it('makes available the correct things', () => {
    expect(reactPoolTime).toEqual({
      generateDuration,
      generateTimeProviders,
      useRelativeTime,
      ...DURATIONS,
    });
  });
});
