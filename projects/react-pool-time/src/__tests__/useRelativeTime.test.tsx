import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import useRelativeTime from '../useRelativeTime';
import createPoolTimeProvider, {
  PoolTimeProviderProps,
} from '../createPoolTimeProvider';
import { ONE_SECOND, ETERNITY } from '../timeObjects';

jest.useFakeTimers();

describe('useRelativeTime()', () => {
  const realDateNow = Date.now;
  const startTime = 1000;

  beforeEach(() => {
    Date.now = jest.fn(() => startTime);
  });

  afterEach(() => {
    Date.now = realDateNow;
  });

  const incrementTime = (ms: number): number => {
    const previousTime = Date.now();
    const nextTime = previousTime + ms;
    (Date.now as jest.Mock).mockImplementation(() => nextTime);
    act(() => {
      jest.advanceTimersByTime(ms);
    });

    return nextTime;
  };

  const generateProviderTestWrapper = (
    PoolTimeProvider: React.FC,
    props: Omit<PoolTimeProviderProps, 'children'> = {}
  ): React.ComponentType => {
    const TestProviderWrapper = React.memo(
      ({ children }: PoolTimeProviderProps) => (
        <PoolTimeProvider {...props}>{children}</PoolTimeProvider>
      )
    );

    TestProviderWrapper.displayName = 'TestProviderWrapper';

    return TestProviderWrapper;
  };

  describe('when there is a single hook rendered', () => {
    describe('when given the simplest possible configuration', () => {
      it.each([
        ['past', -1],
        ['present', 0],
        ['future', 1],
      ])(
        'returns the correct initial result when the target time is in the %s',
        (testKey, difference) => {
          const PoolTimeProvider = createPoolTimeProvider({
            accuracies: [{ upTo: ETERNITY, within: ONE_SECOND }],
          });

          const { result } = renderHook(
            () => useRelativeTime(startTime + difference),
            {
              wrapper: generateProviderTestWrapper(PoolTimeProvider),
            }
          );

          expect(result.current).toEqual({
            difference: 0 - difference,
            time: startTime,
          });
        }
      );

      it('returns the correct result after one tick', () => {
        const PoolTimeProvider = createPoolTimeProvider({
          accuracies: [{ upTo: ETERNITY, within: ONE_SECOND }],
        });

        const { result } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider),
        });

        const nextTime = incrementTime(ONE_SECOND.value);

        expect(result.current).toEqual({
          difference: ONE_SECOND.value,
          time: nextTime,
        });
      });

      it('invokes onIntervalChange with the correct value', () => {
        const PoolTimeProvider = createPoolTimeProvider({
          accuracies: [{ upTo: ETERNITY, within: ONE_SECOND }],
        });

        const handleIntervalChange = jest.fn();

        renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider, {
            onIntervalChange: handleIntervalChange,
          }),
        });

        expect(handleIntervalChange).toHaveBeenCalledTimes(1);
        expect(handleIntervalChange).toHaveBeenLastCalledWith(ONE_SECOND.value);
      });

      it('invokes onRegister with the correct value', () => {
        const PoolTimeProvider = createPoolTimeProvider({
          accuracies: [{ upTo: ETERNITY, within: ONE_SECOND }],
        });

        const handleRegister = jest.fn();

        renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider, {
            onRegister: handleRegister,
          }),
        });

        expect(handleRegister).toHaveBeenCalledTimes(1);
        expect(handleRegister).toHaveBeenLastCalledWith(ONE_SECOND.key);
      });

      it('invokes onRegister with the correct value', () => {
        const PoolTimeProvider = createPoolTimeProvider({
          accuracies: [{ upTo: ETERNITY, within: ONE_SECOND }],
        });

        const handleUnregister = jest.fn();

        const { unmount } = renderHook(() => useRelativeTime(startTime), {
          wrapper: generateProviderTestWrapper(PoolTimeProvider, {
            onUnregister: handleUnregister,
          }),
        });

        expect(handleUnregister).not.toHaveBeenCalled();

        unmount();

        expect(handleUnregister).toHaveBeenCalledTimes(1);
        expect(handleUnregister).toHaveBeenLastCalledWith(ONE_SECOND.key);
      });
    });
  });
});
