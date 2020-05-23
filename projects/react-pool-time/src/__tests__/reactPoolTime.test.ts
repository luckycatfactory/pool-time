import * as reactPoolTime from '../index';

import * as timeObjects from '../timeObjects';
import createPoolTimeProvider from '../createPoolTimeProvider';
import generateTimeObject from '../utilities/generateTimeObject';
import useRelativeTime from '../useRelativeTime';

describe('Exposed API', () => {
  it('exposes exactly the correct things', () => {
    expect(reactPoolTime).toEqual({
      ...timeObjects,
      createPoolTimeProvider,
      generateTimeObject,
      useRelativeTime,
    });
  });
});
