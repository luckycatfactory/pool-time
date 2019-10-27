import useOptimalTimeContext from '../useOptimalTimeContext';
import AccuracyMap from '../../classes/AccuracyMap';
import ONE_SECOND from '../../durations/ONE_SECOND';
import ONE_MINUTE from '../../durations/ONE_MINUTE';

jest.mock('../../classes/AccuracyMap', () => {
  const ONE_SECOND = require('../../durations/ONE_SECOND').default;

  class MockAccuracyMap {}

  MockAccuracyMap.prototype.getOptimalContext = jest.fn(() => ONE_SECOND.context);

  return MockAccuracyMap;
});

describe('useOptimalTimeContext()', () => {
  const mockGetOptimalContext = targetDuration => {
    AccuracyMap.prototype.getOptimalContext.mockImplementationOnce(duration => {
      if (duration === targetDuration) {
        return targetDuration.context;
      } else {
        throw new Error('getOptimalContext was not passed the correct duration.');
      }
    });
  };

  beforeEach(() => {
    AccuracyMap.prototype.getOptimalContext.mockClear();
  });

  describe('when passed a durations list containing a single duration', () => {
    describe('when the difference is negative', () => {
      it('returns the correct duration when passed a difference absolutely less than that single duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND],
          0 - ONE_SECOND.value + 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference absolutely equal to that single duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND],
          0 - ONE_SECOND.value,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference greater than that single duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND],
          0 - ONE_SECOND.value - 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });
    });

    describe('when the difference is positive', () => {
      it('returns the correct duration when passed a difference less than that single duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND],
          ONE_SECOND.value - 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference equal to that single duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND],
          ONE_SECOND.value,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference greater than that single duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND],
          ONE_SECOND.value + 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });
    });
  });

  describe('when passed a durations list containing multiple durations', () => {
    describe('when the difference is negative', () => {
      it('returns the correct duration when passed a difference absolutely less than the target duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND, ONE_MINUTE],
          0 - ONE_MINUTE.value + 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference absolutely equal to the target duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND, ONE_MINUTE],
          0 - ONE_MINUTE.value,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference greater than the target duration', () => {
        mockGetOptimalContext(ONE_MINUTE);

        const context = useOptimalTimeContext(
          [ONE_SECOND, ONE_MINUTE],
          0 - ONE_MINUTE.value - 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_MINUTE.context);
      });
    });

    describe('when the difference is positive', () => {
      it('returns the correct duration when passed a difference less than the target duration', () => {
        mockGetOptimalContext(ONE_SECOND);

        const context = useOptimalTimeContext(
          [ONE_SECOND, ONE_MINUTE],
          ONE_MINUTE.value - 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_SECOND.context);
      });

      it('returns the correct duration when passed a difference equal to the target duration', () => {
        mockGetOptimalContext(ONE_MINUTE);

        const context = useOptimalTimeContext(
          [ONE_SECOND, ONE_MINUTE],
          ONE_MINUTE.value,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_MINUTE.context);
      });

      it('returns the correct duration when passed a difference greater than the target duration', () => {
        mockGetOptimalContext(ONE_MINUTE);

        const context = useOptimalTimeContext(
          [ONE_SECOND, ONE_MINUTE],
          ONE_MINUTE.value + 1,
          new AccuracyMap(),
          new AccuracyMap()
        );
        expect(context).toBe(ONE_MINUTE.context);
      });
    });
  });
});
